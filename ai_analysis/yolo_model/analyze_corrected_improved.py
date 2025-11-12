# analyze_corrected.py

import sys
import os
import json
import cv2
from ultralytics import YOLO
import numpy as np
from json import JSONEncoder
import logging

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
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY_INV) 

    # 2. 컨투어 찾기 및 정렬
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:4]
    
    # 3. 마커 중심 좌표 계산
    marker_centers = []
    for c in contours:
        M = cv2.moments(c)
        if M["m00"] != 0:
            center_x = int(M["m10"] / M["m00"])
            center_y = int(M["m01"] / M["m00"])
            marker_centers.append([center_x, center_y])

    if len(marker_centers) != 4:
        print(f"--- [OpenCV ERROR] 마커 {len(marker_centers)}개 감지 (필요: 4개). "
              f"원본 이미지 반환. ---", file=sys.stderr)
        return image 

    # 4. 마커 좌표 순서 정렬
    markers = np.array(marker_centers, dtype="float32")
    markers_sorted = markers[np.argsort(markers[:, 1])] 
    top = markers_sorted[:2][np.argsort(markers_sorted[:2, 0])]
    bottom = markers_sorted[2:][np.argsort(markers_sorted[2:, 0])]
    
    src_points = np.array([top[0], top[1], bottom[1], bottom[0]], dtype="float32")

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
            {"value": "1000", "x_offset": 255}   # 오른쪽 4번째
        ],
        "Bilirubin": [  # 좌1, 우3 (우측이 다른 항목보다 1칸 더 오른쪽)
            {"value": "neg", "x_offset": -130},  # 왼쪽 1번째
            {"value": "+", "x_offset": 145},     # 오른쪽 1번째 (90 → 145)
            {"value": "++", "x_offset": 200},    # 오른쪽 2번째 (145 → 200)
            {"value": "+++", "x_offset": 255}    # 오른쪽 3번째 (200 → 255)
        ],
        "Ketones": [  # 좌1, 우4
            {"value": "neg", "x_offset": -130},  # 왼쪽 1번째
            {"value": "5", "x_offset": 90},      # 오른쪽 1번째
            {"value": "15", "x_offset": 145},    # 오른쪽 2번째
            {"value": "40", "x_offset": 200},    # 오른쪽 3번째
            {"value": "80", "x_offset": 255}     # 오른쪽 4번째
        ],
        "Specific_Gravity": [  # 좌1, 우6
            {"value": "1.000", "x_offset": -130}, # 왼쪽 1번째
            {"value": "1.010", "x_offset": 90},  # 오른쪽 1번째
            {"value": "1.020", "x_offset": 145}, # 오른쪽 2번째
            {"value": "1.030", "x_offset": 200}, # 오른쪽 3번째
            {"value": "1.040", "x_offset": 255}, # 오른쪽 4번째
            {"value": "1.050", "x_offset": 310}, # 오른쪽 5번째
            {"value": "1.060", "x_offset": 365}  # 오른쪽 6번째
        ],
        "Blood": [  # 좌1, 우3 + 특수2 = 총 6개
            {"value": "neg", "x_offset": -130},        # 왼쪽 1번째
            {"value": "+10", "x_offset": 90},          # 오른쪽 1번째
            {"value": "++50", "x_offset": 145},        # 오른쪽 2번째
            {"value": "+++250", "x_offset": 200},      # 오른쪽 3번째
            {"value": "Non-Hem+10", "x_offset": 255},  # 특수1 (점박이)
            {"value": "Non-Hem++50", "x_offset": 310}  # 특수2 (점박이)
        ],
        "pH": [  # 좌1, 우5
            {"value": "5", "x_offset": -130},    # 왼쪽 1번째
            {"value": "6", "x_offset": 90},      # 오른쪽 1번째
            {"value": "6.5", "x_offset": 145},   # 오른쪽 2번째
            {"value": "7", "x_offset": 200},     # 오른쪽 3번째
            {"value": "8", "x_offset": 255},     # 오른쪽 4번째
            {"value": "9", "x_offset": 310}      # 오른쪽 5번째
        ],
        "Protein": [  # 좌1, 우5
            {"value": "neg", "x_offset": -130},  # 왼쪽 1번째
            {"value": "trace", "x_offset": 90},  # 오른쪽 1번째
            {"value": "30", "x_offset": 145},    # 오른쪽 2번째
            {"value": "100", "x_offset": 200},   # 오른쪽 3번째
            {"value": "300", "x_offset": 255},   # 오른쪽 4번째
            {"value": "1000", "x_offset": 310}   # 오른쪽 5번째
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
    # 기준 색상표 패드는 실제 패드보다 작을 수 있으므로 더 작게 설정
    pad_width = 35  # 45 → 35로 축소
    pad_height = 35  # 45 → 35로 축소
    
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
            
            # ROI 추출 (중앙 60%만 사용하여 배경 제거)
            # margin을 더 크게 하여 중앙 영역만 추출
            margin_ratio = 0.2  # 15% → 20%로 증가 (더 작은 영역 추출)
            margin_x = int((x_max - x_min) * margin_ratio)
            margin_y = int((y_max - y_min) * margin_ratio)
            
            y_min_margin = max(0, y_min + margin_y)
            y_max_margin = min(warped_image.shape[0], y_max - margin_y)
            x_min_margin = max(0, x_min + margin_x)
            x_max_margin = min(warped_image.shape[1], x_max - margin_x)
            
            roi = warped_image[y_min_margin:y_max_margin, x_min_margin:x_max_margin]
            
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
    # 0. 디지털 기준표 로드
    digital_reference = load_digital_reference_data()

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
    model = YOLO(model_path)
    
    # 5. YOLO 추론 (검사 스틱의 패드 찾기)
    results = model(processed_image, verbose=False) 
    
    # 6. YOLO 탐지 결과 1차 처리 (좌표만 추출)
    temp_detections = []
    
    for r in results:
        boxes = r.boxes.xywhn.cpu().numpy() 
        confidences = r.boxes.conf.cpu().numpy()
        classes = r.boxes.cls.cpu().numpy()

        for box_norm, conf, cls_id in zip(boxes, confidences, classes):
            class_name = model.names[int(cls_id)]
            x_min, y_min, x_max, y_max = normalize_to_pixel_coords(box_norm, W_warped, H_warped)
            
            # Y 중심 좌표 계산 (정렬용)
            center_y = (y_min + y_max) // 2
            
            temp_detections.append({
                'class': class_name,
                'box_pixel': [x_min, y_min, x_max, y_max],
                'confidence': float(conf),
                'center_y': center_y  # 정렬 기준
            })
    
    # 📌 Y좌표 기준으로 정렬 (위에서 아래로)
    temp_detections = sorted(temp_detections, key=lambda x: x['center_y'])
    
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
            print(f"  {i+1}. {original_class} → {det['class']} (Y={det['center_y']})", file=sys.stderr)
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
    final_result = {
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
        "detections": pad_results
    }
    
    return final_result

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
        print(json.dumps(result_data, indent=4, cls=NumpyEncoder))
        
    except Exception as e:
        error_output = {"status": "ERROR", "message": str(e), "path": image_path}
        print(json.dumps(error_output), file=sys.stderr)
        sys.exit(1)