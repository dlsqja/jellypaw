# analyze_corrected.py

import sys
import os
import json
import cv2
from ultralytics import YOLO
import numpy as np
from json import JSONEncoder
import logging
from datetime import datetime

logging.getLogger('ultralytics').setLevel(logging.WARNING)

# JSON 직렬화 불가능한 NumPy 타입을 표준 Python 타입으로 변환하는 클래스
class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (np.int_, np.intc, np.intp, np.int8,
                             np.int16, np.int32, np.int64, np.uint8,
                             np.uint16, np.uint32, np.uint64)):
            return int(obj)
        elif isinstance(obj, (np.float64, np.float16, np.float32, np.float64)):
            return float(obj)
        elif isinstance(obj, (np.complex_, np.complex64, np.complex128)):
            return obj.tolist()
        elif isinstance(obj, (np.ndarray,)):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)

# ======================================================================
# 질병 정보 데이터 로드
# ======================================================================
def load_disease_info_data():
    """
    검사 항목별 양성 시 의심되는 질환 정보 로드
    """
    script_dir = os.path.dirname(__file__)
    disease_path = os.path.join(script_dir, 'urine_test_with_diseases.json')

    if not os.path.exists(disease_path):
        raise FileNotFoundError(f"질병 정보 파일이 없습니다: {disease_path}")

    with open(disease_path, 'r', encoding='utf-8') as f:
        print("--- [Load] 질병 정보 데이터 로드 성공. ---", file=sys.stderr)
        return json.load(f)

# ======================================================================
# 디지털 기준 색상표 데이터 로드
# ======================================================================
def load_digital_reference_data():
    """
    디지털 HEX 색상 기준표 로드
    '이상적인' 색상 값, 실제 사용자 이미지와 비교하기 위함
    """
    script_dir = os.path.dirname(__file__)
    ref_path = os.path.join(script_dir, 'digital_reference_colors_hex.json')
    
    if not os.path.exists(ref_path):
        raise FileNotFoundError(f"디지털 기준표 파일이 없습니다: {ref_path}")
    
    with open(ref_path, 'r', encoding='utf-8') as f:
        print("--- [Load] 디지털 기준표 데이터 로드 성공. ---", file=sys.stderr)
        return json.load(f)

# ----------------------------------------------------------------------
# YOLO-OpenCV 좌표 변환 함수
# ----------------------------------------------------------------------
def normalize_to_pixel_coords(box_normalized, image_width, image_height):
    """
    YOLO 정규화된 좌표(x_center, y_center, width, height)를 
    OpenCV 픽셀 좌표(x_min, y_min, x_max, y_max)로 변환합니다.
    """
    x_center, y_center, w_norm, h_norm = box_normalized
    
    x_center_px = x_center * image_width
    y_center_px = y_center * image_height
    width_px = w_norm * image_width
    height_px = h_norm * image_height
    
    x_min = int(x_center_px - width_px / 2)
    y_min = int(y_center_px - height_px / 2)
    x_max = int(x_center_px + width_px / 2)
    y_max = int(y_center_px + height_px / 2)
    
    return [x_min, y_min, x_max, y_max]

# ----------------------------------------------------------------------
# OpenCV 이미지 보정 함수
# ----------------------------------------------------------------------
def perform_warp_perspective(image):
    H, W, _ = image.shape
    
    # 1. 마커 탐지를 위한 전처리
    # 방법 1: 그레이스케일 기반 임계값 처리
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # 방법 2: HSV 색공간에서 검정색/어두운 색상 탐지 (빛 반사 대응)
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    # V(밝기) 값 범위 확대: 빛 반사로 밝아진 마커도 포함 (0-120)
    # S(채도) 조건 완화: 회색/검정색은 채도가 낮지만, 빛 반사 시 채도가 높아질 수 있음
    dark_mask_1 = cv2.inRange(hsv, (0, 0, 0), (180, 50, 100))  # 낮은 채도, 어두운 영역
    dark_mask_2 = cv2.inRange(hsv, (0, 0, 0), (180, 255, 120))  # 높은 채도도 허용, 중간 밝기까지
    dark_mask = cv2.bitwise_or(dark_mask_1, dark_mask_2)
    
    # 방법 3: 상대적 밝기 비교 (주변보다 어두운 영역 찾기)
    # 가우시안 블러로 주변 평균 밝기 계산
    blurred = cv2.GaussianBlur(gray, (21, 21), 0)
    # 각 픽셀이 주변보다 일정 이상 어두운지 확인
    diff = blurred.astype(np.int16) - gray.astype(np.int16)
    relative_dark = (diff > 15).astype(np.uint8) * 255  # 주변보다 15 이상 어두운 영역
    
    # 다중 임계값 시도 (빛바랜 검정색도 탐지하기 위해)
    threshold_values = [30, 50, 70, 90, 110, 130, 150]
    marker_centers = None
    
    for threshold in threshold_values:
        # 그레이스케일 기반 임계값
        _, thresh_gray = cv2.threshold(gray, threshold, 255, cv2.THRESH_BINARY_INV)
        
        # 세 가지 방법을 모두 결합 (OR 연산)
        # 하나라도 검정색/어두운 영역으로 인식되면 마커 후보로 간주
        thresh = cv2.bitwise_or(thresh_gray, dark_mask)
        thresh = cv2.bitwise_or(thresh, relative_dark)
        
        # 2. 컨투어 찾기
        # 노이즈 제거를 위한 모폴로지 연산 (작은 구멍 채우기)
        # 커널 크기를 줄여서 마커 손상 최소화
        kernel = np.ones((2, 2), np.uint8)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
        
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # 3. 마커 필터링 (크기, 위치, 모양 기준)
        filtered_contours = []
        image_area = H * W
        
        for c in contours:
            area = cv2.contourArea(c)
            
            # 크기 필터: 이미지 크기의 0.03% ~ 3% 범위로 완화 (빛 반사로 인한 크기 변화 대응)
            min_area = image_area * 0.0003
            max_area = image_area * 0.03
            if area < min_area or area > max_area:
                continue
            
            # 모양 필터: 정사각형에 가까운지 확인 (완화)
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.05 * peri, True)  # 0.04 -> 0.05로 완화
            
            # 4개의 꼭짓점을 가진 사각형인지 확인 (3-5개 허용)
            if len(approx) < 3 or len(approx) > 5:
                continue
            
            # 종횡비(aspect ratio) 확인 (정사각형에 가까운지, 범위 완화)
            x, y, w, h = cv2.boundingRect(c)
            aspect_ratio = float(w) / h if h > 0 else 0
            if aspect_ratio < 0.6 or aspect_ratio > 1.5:  # 0.7-1.3 -> 0.6-1.5로 완화
                continue
            
            # 위치 필터: 이미지 가장자리 15% 영역에 있는지 확인
            center_x = x + w // 2
            center_y = y + h // 2
            
            edge_margin_x = W * 0.15
            edge_margin_y = H * 0.15
            
            is_near_edge = (
                center_x < edge_margin_x or center_x > (W - edge_margin_x) or
                center_y < edge_margin_y or center_y > (H - edge_margin_y)
            )
            
            if not is_near_edge:
                continue
            
            filtered_contours.append(c)
        
        # 3개 이상 마커를 찾았으면 처리 (4개가 아니어도 투시 변환 가능)
        if len(filtered_contours) >= 3:
            # 넓이 순으로 정렬하고 상위 4개 선택 (3개만 있어도 가능)
            filtered_contours = sorted(filtered_contours, key=cv2.contourArea, reverse=True)[:4]
            
            # 마커 중심 좌표 계산
            marker_centers = []
            for c in filtered_contours:
                M = cv2.moments(c)
                if M["m00"] != 0:
                    center_x = int(M["m10"] / M["m00"])
                    center_y = int(M["m01"] / M["m00"])
                    marker_centers.append([center_x, center_y])
            
            if len(marker_centers) >= 3:
                print(f"--- [OpenCV] 임계값 {threshold}에서 마커 {len(marker_centers)}개 탐지 ---", file=sys.stderr)
                break
    
    # 마커 디버깅 이미지 생성 및 저장 (성공/실패 모두 저장)
    marker_debug_image = image.copy()
    script_dir = os.path.dirname(os.path.abspath(__file__))
    marker_debug_path = os.path.join(script_dir, "debug_marker_detection.jpg")
    
    # 마커를 찾지 못한 경우 (3개 미만)
    if marker_centers is None or len(marker_centers) < 3:
        # 실패한 경우에도 탐지된 마커들을 표시
        if marker_centers:
            for idx, center in enumerate(marker_centers):
                center_int = (int(center[0]), int(center[1]))
                cv2.circle(marker_debug_image, center_int, 20, (0, 0, 255), 3)  # 빨간색 (실패)
                cv2.putText(marker_debug_image, f"마커 {idx+1} (부족)", 
                           (center_int[0] + 25, center_int[1]), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        
        # 에러 메시지 표시
        cv2.putText(marker_debug_image, 
                   f"ERROR: 마커 {len(marker_centers) if marker_centers else 0}개 탐지 (최소 필요: 3개)", 
                   (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
        
        # 디버깅 이미지 저장
        success = cv2.imwrite(marker_debug_path, marker_debug_image)
        if success:
            print(f"[DEBUG] 마커 탐지 실패 디버깅 이미지 저장: {marker_debug_path}", file=sys.stderr)
        else:
            print(f"[ERROR] 마커 디버깅 이미지 저장 실패: {marker_debug_path}", file=sys.stderr)
        
        print(f"--- [OpenCV ERROR] 마커 {len(marker_centers) if marker_centers else 0}개 감지 (최소 필요: 3개). "
              f"원본 이미지 반환. ---", file=sys.stderr)
        return image 

    # 4. 마커 좌표 순서 정렬 및 4번째 마커 추정
    markers = np.array(marker_centers, dtype="float32")
    
    if len(markers) == 3:
        # 3개만 찾은 경우, 4번째 마커 위치 추정
        print(f"--- [OpenCV WARNING] 마커 3개만 탐지. 4번째 마커 위치 추정 시도 ---", file=sys.stderr)
        
        # Y 좌표 기준으로 정렬 (위/아래 구분)
        markers_sorted_y = markers[np.argsort(markers[:, 1])]
        top_markers = markers_sorted_y[:2] if len(markers_sorted_y) >= 2 else markers_sorted_y[:1]
        bottom_markers = markers_sorted_y[2:] if len(markers_sorted_y) >= 3 else markers_sorted_y[1:]
        
        # X 좌표 기준으로 정렬 (좌/우 구분)
        top_sorted_x = top_markers[np.argsort(top_markers[:, 0])] if len(top_markers) > 0 else np.array([])
        bottom_sorted_x = bottom_markers[np.argsort(bottom_markers[:, 0])] if len(bottom_markers) > 0 else np.array([])
        
        # 사각형의 네 모서리 좌표 추출
        # 좌상단, 우상단, 좌하단, 우하단
        top_left = None
        top_right = None
        bottom_left = None
        bottom_right = None
        
        if len(top_sorted_x) == 2:
            top_left = top_sorted_x[0]
            top_right = top_sorted_x[1]
        elif len(top_sorted_x) == 1:
            if top_sorted_x[0][0] < np.mean(markers[:, 0]):  # X 좌표가 평균보다 작으면 좌측
                top_left = top_sorted_x[0]
            else:
                top_right = top_sorted_x[0]
        
        if len(bottom_sorted_x) == 2:
            bottom_left = bottom_sorted_x[0]
            bottom_right = bottom_sorted_x[1]
        elif len(bottom_sorted_x) == 1:
            if bottom_sorted_x[0][0] < np.mean(markers[:, 0]):  # X 좌표가 평균보다 작으면 좌측
                bottom_left = bottom_sorted_x[0]
            else:
                bottom_right = bottom_sorted_x[0]
        
        # 누락된 마커 추정
        estimated_4th = None
        if top_left is not None and top_right is not None and bottom_left is not None:
            # 우하단 누락: (우상단.x, 좌하단.y)
            estimated_4th = np.array([top_right[0], bottom_left[1]], dtype="float32")
            print(f"--- [OpenCV] 우하단 마커 추정: ({int(estimated_4th[0])}, {int(estimated_4th[1])}) ---", file=sys.stderr)
        elif top_left is not None and top_right is not None and bottom_right is not None:
            # 좌하단 누락: (좌상단.x, 우하단.y)
            estimated_4th = np.array([top_left[0], bottom_right[1]], dtype="float32")
            print(f"--- [OpenCV] 좌하단 마커 추정: ({int(estimated_4th[0])}, {int(estimated_4th[1])}) ---", file=sys.stderr)
        elif top_left is not None and bottom_left is not None and bottom_right is not None:
            # 우상단 누락: (우하단.x, 좌상단.y)
            estimated_4th = np.array([bottom_right[0], top_left[1]], dtype="float32")
            print(f"--- [OpenCV] 우상단 마커 추정: ({int(estimated_4th[0])}, {int(estimated_4th[1])}) ---", file=sys.stderr)
        elif top_right is not None and bottom_left is not None and bottom_right is not None:
            # 좌상단 누락: (좌하단.x, 우상단.y)
            estimated_4th = np.array([bottom_left[0], top_right[1]], dtype="float32")
            print(f"--- [OpenCV] 좌상단 마커 추정: ({int(estimated_4th[0])}, {int(estimated_4th[1])}) ---", file=sys.stderr)
        else:
            # 예외 상황: 기본 추정 방법 사용
            print(f"--- [OpenCV WARNING] 예외 상황. 기본 추정 방법 사용 ---", file=sys.stderr)
            center_point = np.mean(markers, axis=0)
            vectors = markers - center_point
            distances = np.linalg.norm(vectors, axis=1)
            farthest_idx = np.argmax(distances)
            estimated_4th = center_point - vectors[farthest_idx]
            print(f"--- [OpenCV] 4번째 마커 추정 위치: ({int(estimated_4th[0])}, {int(estimated_4th[1])}) ---", file=sys.stderr)
        
        if estimated_4th is not None:
            # 추정된 4번째 마커를 배열에 추가
            markers = np.vstack([markers, estimated_4th])
    
    # 마커 좌표 순서 정렬
    markers_sorted = markers[np.argsort(markers[:, 1])] 
    top = markers_sorted[:2][np.argsort(markers_sorted[:2, 0])]
    bottom = markers_sorted[2:][np.argsort(markers_sorted[2:, 0])]
    
    src_points = np.array([top[0], top[1], bottom[1], bottom[0]], dtype="float32")

    # 4-1. 마커 디버깅 이미지에 마커 표시 (성공한 경우)
    marker_labels = ["1 (좌상)", "2 (우상)", "3 (우하)", "4 (좌하)"]
    original_count = len(marker_centers)
    
    for idx, (center, label) in enumerate(zip(src_points, marker_labels)):
        center_int = (int(center[0]), int(center[1]))
        
        # 4번째 마커가 추정된 경우 노란색으로 표시
        if original_count == 3 and idx == 3:
            # 큰 원 (외곽) - 노란색 (추정)
            cv2.circle(marker_debug_image, center_int, 20, (0, 255, 255), 3)
            # 작은 원 (중심) - 빨간색
            cv2.circle(marker_debug_image, center_int, 5, (0, 0, 255), -1)
            # 마커 번호 및 라벨 표시 (추정 표시)
            cv2.putText(marker_debug_image, label + " (추정)", 
                       (center_int[0] + 25, center_int[1]), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
        else:
            # 큰 원 (외곽) - 초록색 (성공)
            cv2.circle(marker_debug_image, center_int, 20, (0, 255, 0), 3)
            # 작은 원 (중심) - 빨간색
            cv2.circle(marker_debug_image, center_int, 5, (0, 0, 255), -1)
            # 마커 번호 및 라벨 표시
            cv2.putText(marker_debug_image, label, 
                       (center_int[0] + 25, center_int[1]), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
    
    # 투시 변환 사각형 그리기 (연결선)
    pts = src_points.astype(np.int32)
    cv2.line(marker_debug_image, tuple(pts[0]), tuple(pts[1]), (255, 0, 0), 2)
    cv2.line(marker_debug_image, tuple(pts[1]), tuple(pts[2]), (255, 0, 0), 2)
    cv2.line(marker_debug_image, tuple(pts[2]), tuple(pts[3]), (255, 0, 0), 2)
    cv2.line(marker_debug_image, tuple(pts[3]), tuple(pts[0]), (255, 0, 0), 2)
    
    # 성공 메시지 표시
    if original_count == 3:
        cv2.putText(marker_debug_image, f"SUCCESS: 마커 {original_count}개 탐지, 1개 추정", 
                   (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    else:
        cv2.putText(marker_debug_image, "SUCCESS: 마커 4개 탐지 완료", 
                   (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
    
    # 마커 디버깅 이미지 저장 (스크립트 파일이 있는 디렉토리에 저장)
    success = cv2.imwrite(marker_debug_path, marker_debug_image)
    if success:
        print(f"[DEBUG] 마커 탐지 디버깅 이미지 저장: {marker_debug_path}", file=sys.stderr)
    else:
        print(f"[ERROR] 마커 디버깅 이미지 저장 실패: {marker_debug_path}", file=sys.stderr)

    # 5. 목표 좌표 정의
    target_width = 600
    target_height = 1000
    
    dst_points = np.array([
        [0, 0], [target_width - 1, 0], 
        [target_width - 1, target_height - 1], [0, target_height - 1]
    ], dtype="float32")

    # 6. 투시 변환 실행
    M = cv2.getPerspectiveTransform(src_points, dst_points)
    warped_image = cv2.warpPerspective(image, M, (target_width, target_height))
    
    print("--- [OpenCV] 투시 변환 완료. ---", file=sys.stderr)
    return warped_image

# ======================================================================
# 🎯 [개선] YOLO 결과 기반으로 기준 색상표 추출
# ======================================================================
def extract_reference_colors_from_yolo(warped_image, yolo_detections, debug_image=None):
    """
    YOLO가 찾은 검사 스틱 패드의 Y좌표를 기준으로
    같은 높이의 기준 색상표를 추출합니다.
    
    Args:
        warped_image: 투시 변환된 이미지
        yolo_detections: YOLO가 찾은 패드 정보 리스트
        debug_image: 디버깅용 이미지 (선택)
    
    Returns:
        각 검사 항목별 기준 색상 LAB 값
    """
    print("--- [OpenCV] YOLO 기반 기준 색상표 추출 시작 ---", file=sys.stderr)
    
    # YOLO 탐지 결과를 검사 항목별로 정리
    test_positions = {}
    for detection in yolo_detections:
        class_name = detection['class']
        test_name = class_name.replace("pad_", "")
        
        # 클래스 이름 매핑
        name_mapping = {
            "SG": "Specific_Gravity",
        }
        if test_name in name_mapping:
            test_name = name_mapping[test_name]
        
        # 패드 중심 Y 좌표 계산
        box = detection['box_pixel']
        center_y = (box[1] + box[3]) // 2
        center_x = (box[0] + box[2]) // 2
        
        test_positions[test_name] = {
            'y': center_y,
            'x_pad': center_x
        }
    
    # 각 검사 항목별 기준 색상 상대 위치 (X 오프셋)
    # 음수(-): 왼쪽 (주로 정상), 양수(+): 오른쪽 (주로 비정상)
    # 기준표 색상 간 간격: 약 55픽셀 (중심 간 거리)
    # 좌/우측 기준표는 스틱과 약 1칸(~50-60px) 공백 필요
    reference_offsets = {
        "Urobilinogen": [  # 좌2, 우3 = 총 5개 (왼쪽 위치 유지)
            {"value": "0.1", "x_offset": -130},  # 왼쪽 2번째
            {"value": "2", "x_offset": -75},     # 왼쪽 1번째
            {"value": "4", "x_offset": 90},      # 오른쪽 1번째
            {"value": "8", "x_offset": 145},     # 오른쪽 2번째
            {"value": "16", "x_offset": 200}     # 오른쪽 3번째
        ],
        "Glucose": [  # 좌1, 우4
            {"value": "neg", "x_offset": -130},  # 왼쪽 1번째
            {"value": "100", "x_offset": 90},    # 오른쪽 1번째
            {"value": "250", "x_offset": 145},   # 오른쪽 2번째
            {"value": "500", "x_offset": 200},   # 오른쪽 3번째
            {"value": "1000", "x_offset": 310}   # 오른쪽 4번째
        ],
        "Bilirubin": [  # 좌1, 우3 (우측이 다른 항목보다 1칸 더 오른쪽)
            {"value": "neg", "x_offset": -130},  # 왼쪽 1번째
            {"value": "+", "x_offset": 145},     # 오른쪽 1번째 (90 → 145)
            {"value": "++", "x_offset": 200},    # 오른쪽 2번째 (145 → 200)
            {"value": "+++", "x_offset": 310}    # 오른쪽 3번째 (200 → 255)
        ],
        "Ketones": [  # 좌1, 우4
            {"value": "neg", "x_offset": -130},  # 왼쪽 1번째
            {"value": "5", "x_offset": 90},      # 오른쪽 1번째
            {"value": "15", "x_offset": 145},    # 오른쪽 2번째
            {"value": "40", "x_offset": 200},    # 오른쪽 3번째
            {"value": "80", "x_offset": 310}     # 오른쪽 4번째
        ],
        "Specific_Gravity": [  # 좌1, 우6
            {"value": "1.000", "x_offset": -130}, # 왼쪽 1번째
            {"value": "1.010", "x_offset": 90},  # 오른쪽 1번째
            {"value": "1.020", "x_offset": 145}, # 오른쪽 2번째
            {"value": "1.030", "x_offset": 200}, # 오른쪽 3번째
            {"value": "1.040", "x_offset": 310}, # 오른쪽 4번째
            {"value": "1.050", "x_offset": 365}, # 오른쪽 5번째
            {"value": "1.060", "x_offset": 420}  # 오른쪽 6번째
        ],
        "Blood": [  # 좌1, 우3 + 특수2 = 총 6개
            {"value": "neg", "x_offset": -130},        # 왼쪽 1번째
            {"value": "+10", "x_offset": 90},          # 오른쪽 1번째
            {"value": "++50", "x_offset": 145},        # 오른쪽 2번째
            {"value": "+++250", "x_offset": 200},      # 오른쪽 3번째
            {"value": "Non-Hem+10", "x_offset": 310},  # 특수1 (점박이)
            {"value": "Non-Hem++50", "x_offset": 365}  # 특수2 (점박이)
        ],
        "pH": [  # 좌1, 우5
            {"value": "5", "x_offset": -130},    # 왼쪽 1번째
            {"value": "6", "x_offset": 90},      # 오른쪽 1번째
            {"value": "6.5", "x_offset": 145},   # 오른쪽 2번째
            {"value": "7", "x_offset": 200},     # 오른쪽 3번째
            {"value": "8", "x_offset": 310},     # 오른쪽 4번째
            {"value": "9", "x_offset": 365}      # 오른쪽 5번째
        ],
        "Protein": [  # 좌1, 우5
            {"value": "neg", "x_offset": -130},  # 왼쪽 1번째
            {"value": "trace", "x_offset": 90},  # 오른쪽 1번째
            {"value": "30", "x_offset": 145},    # 오른쪽 2번째
            {"value": "100", "x_offset": 200},   # 오른쪽 3번째
            {"value": "300", "x_offset": 310},   # 오른쪽 4번째
            {"value": "1000", "x_offset": 365}   # 오른쪽 5번째
        ],
        "Nitrite": [  # 좌1, 우2
            {"value": "neg", "x_offset": -130},  # 왼쪽 1번째
            {"value": "trace", "x_offset": 90},  # 오른쪽 1번째
            {"value": "pos", "x_offset": 145}    # 오른쪽 2번째
        ],
        "Leukocytes": [  # 좌1, 우3
            {"value": "neg", "x_offset": -130},  # 왼쪽 1번째
            {"value": "25", "x_offset": 90},     # 오른쪽 1번째
            {"value": "75", "x_offset": 145},    # 오른쪽 2번째
            {"value": "500", "x_offset": 200}    # 오른쪽 3번째
        ]
    }
    
    # 색상 패드 크기 (실제 기준 색상표 크기에 맞춤)
    # 외곽 박스 크기 (디버깅용 표시, 실제 추출 영역과는 별개)
    pad_width = 50  # 외곽 박스 크기 (디버깅용)
    pad_height = 50  # 외곽 박스 크기 (디버깅용)
    
    # 실제 색상 추출 영역 크기 (고정, 중앙 영역만 사용)
    extract_width = 25  # 실제 추출 영역 너비
    extract_height = 25  # 실제 추출 영역 높이
    
    # 추출된 기준 색상표
    extracted_references = {}
    
    for test_name, position in test_positions.items():
        if test_name not in reference_offsets:
            print(f"[WARNING] {test_name}의 기준 오프셋 정보 없음", file=sys.stderr)
            continue
        
        row_y = position['y']
        pad_x = position['x_pad']
        test_colors = []
        
        offsets = reference_offsets[test_name]
        
        for color_info in offsets:
            # YOLO 패드 X 좌표 + 오프셋 = 기준표 X 좌표
            x = pad_x + color_info["x_offset"]
            value = color_info["value"]
            
            # 이미지 범위 체크
            y_min = max(0, row_y - pad_height // 2)
            y_max = min(warped_image.shape[0], row_y + pad_height // 2)
            x_min = max(0, x - pad_width // 2)
            x_max = min(warped_image.shape[1], x + pad_width // 2)
            
            # 디버깅: 파란색 사각형 표시 (외곽 박스)
            if debug_image is not None:
                cv2.rectangle(debug_image, (x_min, y_min), (x_max, y_max), (255, 0, 0), 2)
                # 값 표시 (선택)
                cv2.putText(debug_image, str(value), (x_min, y_min - 3), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.3, (255, 0, 0), 1)
            
            # ROI 추출 (중앙 고정 크기 영역만 사용하여 배경 제거)
            # 외곽 박스 크기와 관계없이 항상 동일한 크기의 중앙 영역만 추출
            center_x = (x_min + x_max) // 2
            center_y = (y_min + y_max) // 2
            
            # 고정 크기의 중앙 영역 계산
            x_min_extract = max(0, center_x - extract_width // 2)
            x_max_extract = min(warped_image.shape[1], center_x + extract_width // 2)
            y_min_extract = max(0, center_y - extract_height // 2)
            y_max_extract = min(warped_image.shape[0], center_y + extract_height // 2)
            
            roi = warped_image[y_min_extract:y_max_extract, x_min_extract:x_max_extract]
            
            if roi.size == 0:
                print(f"[WARNING] {test_name} - {value} ROI 추출 실패 (x={x}, y={row_y})", 
                      file=sys.stderr)
                continue
            
            # LAB 색상 추출
            lab_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2LAB)
            mean_lab = np.mean(lab_roi, axis=(0, 1))
            
            test_colors.append({
                "value": value,
                "lab": [float(mean_lab[0]), float(mean_lab[1]), float(mean_lab[2])]
            })
        
        extracted_references[test_name] = test_colors
        print(f"[INFO] {test_name}: {len(test_colors)}개 기준 색상 추출 (Y={row_y})", 
              file=sys.stderr)
    
    print("--- [OpenCV] 기준 색상표 추출 완료 ---", file=sys.stderr)
    return extracted_references

# ======================================================================
# 회색 직사각형 색상 보정
# ======================================================================
def extract_gray_reference(warped_image):
    """
    회색 직사각형에서 기준 색상 추출 (색상 보정용)
    상대 좌표: (86, 15) ~ (122, 526)
    """
    gray_roi = warped_image[15:526, 86:122]
    
    if gray_roi.size == 0:
        print("[WARNING] 회색 영역 추출 실패", file=sys.stderr)
        return None
    
    gray_lab = cv2.cvtColor(gray_roi, cv2.COLOR_BGR2LAB)
    mean_gray = np.mean(gray_lab, axis=(0, 1))
    
    print(f"[INFO] 회색 기준 LAB: {mean_gray}", file=sys.stderr)
    return mean_gray

def calculate_color_correction(measured_gray):
    """색상 보정 계수 계산"""
    if measured_gray is None:
        return [1.0, 0.0, 0.0]
    
    expected_gray = np.array([128.0, 128.0, 128.0])
    
    L_correction = expected_gray[0] / measured_gray[0] if measured_gray[0] != 0 else 1.0
    A_correction = expected_gray[1] - measured_gray[1]
    B_correction = expected_gray[2] - measured_gray[2]
    
    print(f"[INFO] 색상 보정 계수: L={L_correction:.3f}, A={A_correction:.3f}, B={B_correction:.3f}", 
          file=sys.stderr)
    
    return [L_correction, A_correction, B_correction]

def apply_color_correction(lab_color, correction):
    """LAB 색상에 보정 적용"""
    L, A, B = lab_color
    L_corr, A_corr, B_corr = correction
    
    L_corrected = L * L_corr
    A_corrected = A + A_corr
    B_corrected = B + B_corr
    
    return [L_corrected, A_corrected, B_corrected]

# ----------------------------------------------------------------------
# OpenCV 색상 추출 함수
# ----------------------------------------------------------------------
def extract_lab_color(image_warped, box_pixel, center_ratio=0.7):
    """중앙 70% 영역의 평균 LAB 색상 값 추출"""
    x_min, y_min, x_max, y_max = box_pixel
    
    width = x_max - x_min
    height = y_max - y_min
    
    # 중앙 70% 영역 계산
    margin_x = width * (1 - center_ratio) / 2
    margin_y = height * (1 - center_ratio) / 2
    
    x_min_centered = int(x_min + margin_x)
    y_min_centered = int(y_min + margin_y)
    x_max_centered = int(x_max - margin_x)
    y_max_centered = int(y_max - margin_y)
    
    try:
        roi = image_warped[y_min_centered:y_max_centered, x_min_centered:x_max_centered]
    except IndexError:
        print(f"--- [Color ERROR] ROI 추출 중 오류: {box_pixel} ---", file=sys.stderr)
        return [0.0, 0.0, 0.0]

    if roi.size == 0 or roi.shape[0] < 1 or roi.shape[1] < 1:
        return [0.0, 0.0, 0.0]

    lab_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2LAB)
    mean_lab = np.mean(lab_roi, axis=(0, 1))

    return [float(mean_lab[0]), float(mean_lab[1]), float(mean_lab[2])]

# ----------------------------------------------------------------------
# Delta E 계산 및 진단 
# ----------------------------------------------------------------------
def calculate_delta_e(lab1, lab2):
    """Delta E (CIE76) 계산"""
    L1, A1, B1 = lab1
    L2, A2, B2 = lab2
    
    delta_e = np.sqrt(
        (L1 - L2)**2 + (A1 - A2)**2 + (B1 - B2)**2
    )
    return float(delta_e)

def perform_diagnosis(class_name, measured_lab, extracted_references, digital_reference):
    """측정된 LAB 값과 사용자 이미지에서 추출한 기준 색상을 비교 (근사치 판단 포함)"""
    if class_name not in extracted_references:
        return {
            "result": "진단 불가 (기준 색상 없음)",
            "delta_e": None,
            "matched_value": None,
            "is_approximate": False
        }

    reference_colors = extracted_references[class_name]
    
    best_match = None
    min_delta_e = float('inf')
    
    # 모든 기준 색상과 비교하여 가장 유사한 색상 찾기
    for ref in reference_colors:
        ref_lab = ref['lab']
        delta_e = calculate_delta_e(measured_lab, ref_lab)
        
        if delta_e < min_delta_e:
            min_delta_e = delta_e
            best_match = ref
    
    # 근사치 판단 임계값 설정
    # Delta E < 20: 매우 유사 (근사치로 판단)
    # Delta E 20-40: 유사 (근사치로 판단, 신뢰도 중간)
    # Delta E > 40: 다름 (근사치 아님, 신뢰도 낮음)
    APPROXIMATE_THRESHOLD = 40.0
    HIGH_CONFIDENCE_THRESHOLD = 20.0
    
    is_approximate = min_delta_e < APPROXIMATE_THRESHOLD
    confidence = "high" if min_delta_e < HIGH_CONFIDENCE_THRESHOLD else "medium" if min_delta_e < APPROXIMATE_THRESHOLD else "low"
    
    metadata = get_metadata_from_digital_reference(class_name, best_match['value'], digital_reference)
    
    result_dict = {
        "matched_value": best_match['value'],
        "delta_e": round(min_delta_e, 2),
        "result": metadata.get('result', 'unknown'),
        "is_normal": metadata.get('is_normal', False),
        "severity": metadata.get('severity', 'N/A'),
        "is_approximate": is_approximate,
        "confidence": confidence
    }
    
    # Delta E가 임계값을 초과하면 경고 추가
    if min_delta_e >= APPROXIMATE_THRESHOLD:
        result_dict["warning"] = f"Delta E가 높습니다 ({min_delta_e:.2f}). 결과 신뢰도가 낮을 수 있습니다."
        print(f"[WARNING] {class_name}: Delta E={min_delta_e:.2f} (임계값 초과, 근사치 아님)", 
              file=sys.stderr)
    
    return result_dict


def get_suspected_conditions(test_name, diagnosis, disease_info_data):
    """
    진단 결과를 기반으로 의심되는 질환 목록 반환
    """
    if disease_info_data is None:
        return []

    disease_entry = disease_info_data.get(test_name)
    if not disease_entry:
        return []

    disease_info = disease_entry.get('disease_info', {})
    if not disease_info:
        return []

    result_key = diagnosis.get('result')
    severity_key = diagnosis.get('severity')
    is_normal = diagnosis.get('is_normal', False)

    # 1. 결과(result)에 직접 매핑
    if result_key and result_key in disease_info:
        return disease_info[result_key].get('conditions', [])

    # 2. 중증도(severity) 매핑
    if severity_key and severity_key in disease_info:
        return disease_info[severity_key].get('conditions', [])

    # 3. 양성계열에 대한 포괄 키
    if not is_normal:
        # SG 등에서 high/low로 나뉘는 경우
        if severity_key:
            # severity 값이 "high", "moderate", "severe", "very_severe" 등인 경우 "high"로 매핑
            # severity 값이 "low", "trace", "mild" 등인 경우 "low"로 매핑
            severity_lower = str(severity_key).lower()
            
            # high 계열: moderate, severe, very_severe, high
            if 'high' in disease_info:
                if any(keyword in severity_lower for keyword in ['high', 'moderate', 'severe', 'very_severe']):
                    return disease_info['high'].get('conditions', [])
            
            # low 계열: low, trace, mild
            if 'low' in disease_info:
                if any(keyword in severity_lower for keyword in ['low', 'trace', 'mild']):
                    return disease_info['low'].get('conditions', [])
            
            # 문자열 포함 여부로도 체크 (기존 로직 유지)
            if 'high' in disease_info and 'high' in severity_lower:
                return disease_info['high'].get('conditions', [])
            if 'low' in disease_info and 'low' in severity_lower:
                return disease_info['low'].get('conditions', [])

        if 'positive' in disease_info:
            return disease_info['positive'].get('conditions', [])

    # 4. 기본적으로 질환 정보가 없으면 빈 리스트
    # 정상/음성 결과의 경우 질병 정보가 없는 것이 정상입니다.
    return []


def build_frontend_summary(pad_results, disease_info_data):
    """
    프론트엔드에서 사용하기 쉬운 형태로 검사 결과 가공
    """
    summary_list = []

    for pad in pad_results:
        class_name = pad['class']
        test_name = class_name.replace("pad_", "")

        # 이름 매핑 (SG 등)
        name_mapping = {
            "SG": "Specific_Gravity",
        }
        if test_name in name_mapping:
            test_name = name_mapping[test_name]

        diagnosis = pad.get('diagnosis', {})
        disease_entry = disease_info_data.get(test_name, {}) if disease_info_data else {}

        summary_list.append({
            "test_code": test_name,
            "test_name_ko": disease_entry.get('test_name_ko'),
            "test_name_en": disease_entry.get('test_name_en'),
            "unit": disease_entry.get('unit'),
            "matched_value": diagnosis.get('matched_value'),
            "result": diagnosis.get('result'),
            "is_normal": diagnosis.get('is_normal'),
            "severity": diagnosis.get('severity'),
            "delta_e": diagnosis.get('delta_e'),
            "is_approximate": diagnosis.get('is_approximate', False),
            "confidence": diagnosis.get('confidence'),
            "suspected_conditions": get_suspected_conditions(test_name, diagnosis, disease_info_data)
        })

    return summary_list


def save_full_analysis_result(full_result):
    """
    상세 분석 결과 파일로 저장
    """
    try:
        base_dir = os.path.dirname(__file__)
        output_dir = os.path.join(base_dir, "results")
        os.makedirs(output_dir, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"analysis_detail_{timestamp}.json"
        file_path = os.path.join(output_dir, filename)

        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(full_result, f, indent=2, ensure_ascii=False, cls=NumpyEncoder)

        print(f"--- [Save] 상세 분석 결과 저장: {file_path} ---", file=sys.stderr)
        return file_path
    except Exception as e:
        print(f"[WARNING] 상세 결과 저장 실패: {e}", file=sys.stderr)
        return None

def get_metadata_from_digital_reference(class_name, value, digital_reference):
    """디지털 기준표에서 메타데이터 추출"""
    if class_name not in digital_reference:
        return {}
    
    test_data = digital_reference[class_name]
    
    for color_key, color_info in test_data.get('colors', {}).items():
        if color_info['value'] == value:
            return {
                'result': color_info.get('result', 'unknown'),
                'is_normal': color_info.get('is_normal', False),
                'severity': color_info.get('severity', 'N/A')
            }
    
    return {}

# ----------------------------------------------------------------------
# 메인 분석 파이프라인
# ----------------------------------------------------------------------
def analyze_image_pipeline(image_path):
    # 0. 디지털 기준표 및 질병 정보 로드
    digital_reference = load_digital_reference_data()
    disease_info_data = load_disease_info_data()

    # 1. 파일 로드
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"이미지 파일을 로드할 수 없습니다: {image_path}")

    # 2. 투시 변환
    processed_image = perform_warp_perspective(image)
    H_warped, W_warped, _ = processed_image.shape

    # 3. 회색 영역 추출 및 색상 보정 계수 계산
    measured_gray = extract_gray_reference(processed_image)
    color_correction = calculate_color_correction(measured_gray)
    
    # 4. YOLO 모델 로드
    model_path = os.path.join(os.path.dirname(__file__), 'weights', 'best.pt') 
    # Docker 빌드할때는 아래 경로, 위에 주석처리
    # model_path = os.path.join('/app', 'weights', 'best.pt')
    model = YOLO(model_path)
    
    # 5. YOLO 추론 (검사 스틱의 패드 찾기)
    results = model(processed_image, verbose=False) 
    
    # 6. YOLO 탐지 결과 1차 처리 (좌표만 추출)
    temp_detections = []
    
    # Confidence 임계값 설정 (낮은 신뢰도 탐지 제외)
    CONFIDENCE_THRESHOLD = 0.5
    
    for r in results:
        boxes = r.boxes.xywhn.cpu().numpy() 
        confidences = r.boxes.conf.cpu().numpy()
        classes = r.boxes.cls.cpu().numpy()

        for box_norm, conf, cls_id in zip(boxes, confidences, classes):
            # Confidence 필터링
            if float(conf) < CONFIDENCE_THRESHOLD:
                continue
                
            class_name = model.names[int(cls_id)]
            x_min, y_min, x_max, y_max = normalize_to_pixel_coords(box_norm, W_warped, H_warped)
            
            # Y 중심 좌표 계산 (정렬용)
            center_y = (y_min + y_max) // 2
            center_x = (x_min + x_max) // 2
            
            # 위치 필터링: 스틱은 이미지 중앙에 위치 (X 좌표가 중앙 ± 30% 범위)
            image_center_x = W_warped / 2
            x_margin = W_warped * 0.3
            if center_x < (image_center_x - x_margin) or center_x > (image_center_x + x_margin):
                print(f"[FILTER] X 좌표 범위 초과: {class_name} (X={center_x}, confidence={conf:.2f})", file=sys.stderr)
                continue
            
            temp_detections.append({
                'class': class_name,
                'box_pixel': [x_min, y_min, x_max, y_max],
                'confidence': float(conf),
                'center_y': center_y,  # 정렬 기준
                'center_x': center_x
            })
    
    print(f"[INFO] Confidence 필터링 후: {len(temp_detections)}개 탐지 (임계값: {CONFIDENCE_THRESHOLD})", file=sys.stderr)
    
    # 📌 Y좌표 기준으로 정렬 (위에서 아래로)
    temp_detections = sorted(temp_detections, key=lambda x: x['center_y'])
    
    # 📌 중복 제거: Y 좌표가 너무 가까운 탐지 제거 (같은 패드의 중복 탐지 방지)
    MIN_PAD_DISTANCE = 30  # 픽셀 단위 (패드 간 최소 거리)
    filtered_detections = []
    
    for det in temp_detections:
        is_duplicate = False
        for existing in filtered_detections:
            y_distance = abs(det['center_y'] - existing['center_y'])
            if y_distance < MIN_PAD_DISTANCE:
                # 더 높은 confidence를 가진 탐지 선택
                if det['confidence'] > existing['confidence']:
                    filtered_detections.remove(existing)
                    break
                else:
                    is_duplicate = True
                    break
        
        if not is_duplicate:
            filtered_detections.append(det)
    
    print(f"[INFO] 중복 제거 후: {len(filtered_detections)}개 탐지", file=sys.stderr)
    
    # 📌 상위 10개만 선택 (패드는 항상 10개)
    if len(filtered_detections) > 10:
        print(f"[WARNING] 탐지된 패드가 10개를 초과합니다. 상위 10개만 선택합니다.", file=sys.stderr)
        filtered_detections = filtered_detections[:10]
    elif len(filtered_detections) < 10:
        print(f"[WARNING] 탐지된 패드가 10개 미만입니다. ({len(filtered_detections)}개)", file=sys.stderr)
    
    temp_detections = filtered_detections
    
    # 📌 올바른 순서로 클래스 이름 재할당
    correct_order = [
        "pad_Urobilinogen",
        "pad_Glucose", 
        "pad_Bilirubin",
        "pad_Ketones",
        "pad_SG",
        "pad_Blood",
        "pad_pH",
        "pad_Protein",
        "pad_Nitrite",
        "pad_Leukocytes"
    ]
    
    print(f"[INFO] YOLO 탐지 결과 정렬 및 재매핑: {len(temp_detections)}개 패드", file=sys.stderr)
    for i, det in enumerate(temp_detections):
        original_class = det['class']
        if i < len(correct_order):
            det['class'] = correct_order[i]
            print(f"  {i+1}. {original_class} → {det['class']} (Y={det['center_y']}, conf={det['confidence']:.2f})", file=sys.stderr)
        else:
            print(f"  {i+1}. {det['class']} (Y={det['center_y']}) [범위 초과]", file=sys.stderr)
    
    # 디버깅 이미지에 표시
    debug_image = processed_image.copy()
    for i, detection in enumerate(temp_detections):
        x_min, y_min, x_max, y_max = detection['box_pixel']
        class_name = detection['class']
        
        # 빨간색 사각형 표시 (패드)
        cv2.rectangle(debug_image, (x_min, y_min), (x_max, y_max), (0, 0, 255), 2)
        # 순서 번호 표시
        cv2.putText(debug_image, f"{i+1}:{class_name}", (x_min, y_min - 5), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
    
    # 📌 7. YOLO 결과 기반으로 기준 색상표 추출
    extracted_references = extract_reference_colors_from_yolo(
        processed_image, 
        temp_detections,
        debug_image  # 디버깅 이미지 전달
    )
    
    # 📌 7-1. 기준 색상표에도 동일한 보정 적용
    print("--- [INFO] 기준 색상표에 색상 보정 적용 시작 ---", file=sys.stderr)
    for test_name in extracted_references:
        for color_info in extracted_references[test_name]:
            original_lab = color_info['lab']
            corrected_lab = apply_color_correction(original_lab, color_correction)
            color_info['lab'] = corrected_lab
    print("--- [INFO] 기준 색상표 색상 보정 완료 ---", file=sys.stderr)
    
    # 8. 최종 진단 수행
    pad_results = []
    
    for detection in temp_detections:
        class_name = detection['class']
        test_name = class_name.replace("pad_", "")
        
        # 클래스 이름 매핑
        name_mapping = {
            "SG": "Specific_Gravity",
        }
        if test_name in name_mapping:
            test_name = name_mapping[test_name]
        
        box_pixel = detection['box_pixel']
        
        # 패드 색상 추출
        measured_lab = extract_lab_color(processed_image, box_pixel)
        
        # 색상 보정 적용
        corrected_lab = apply_color_correction(measured_lab, color_correction)
        
        # 진단
        diagnosis_info = perform_diagnosis(test_name, corrected_lab, 
                                          extracted_references, digital_reference)

        pad_results.append({
            "class": class_name,
            "confidence": round(detection['confidence'], 4),
            "box_pixel": [int(x) for x in box_pixel],
            "lab_measured": [round(x, 2) for x in measured_lab],
            "lab_corrected": [round(x, 2) for x in corrected_lab],
            "diagnosis": diagnosis_info
        })
    
    # 9. 디버깅 이미지 저장
    cv2.imwrite("debug_visualization_output.png", debug_image)
    print("[DEBUG] 시각화 이미지 저장: debug_visualization_output.png", file=sys.stderr)
    
    # 10. 최종 결과
    frontend_summary = build_frontend_summary(pad_results, disease_info_data)

    full_result = {
        "status": "SUCCESS",
        "image_info": {
            "warped_size": f"{W_warped}x{H_warped}"
        },
        "color_correction": {
            "gray_measured": [round(float(x), 2) for x in measured_gray] if measured_gray is not None else None,
            "correction_applied": color_correction
        },
        "reference_extracted": {
            test: len(colors) for test, colors in extracted_references.items()
        },
        "analysis_count": len(pad_results),
        "detections": pad_results,
        "frontend_summary": frontend_summary
    }
    detail_file_path = save_full_analysis_result(full_result)

    frontend_response = {
        "status": "SUCCESS",
        "analysis_count": len(frontend_summary),
        "summary": frontend_summary
    }

    if detail_file_path:
        frontend_response["detail_saved_path"] = detail_file_path

    return frontend_response

# ----------------------------------------------------------------------
# 스크립트 실행
# ----------------------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze_corrected.py <image_path>", file=sys.stderr)
        sys.exit(1)
        
    image_path = sys.argv[1]

    try:
        result_data = analyze_image_pipeline(image_path)
        print(json.dumps(result_data, indent=4, ensure_ascii=False, cls=NumpyEncoder))
        
    except Exception as e:
        error_output = {"status": "ERROR", "message": str(e), "path": image_path}
        print(json.dumps(error_output, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)