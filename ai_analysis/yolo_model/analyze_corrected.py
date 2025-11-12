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
# 📌 [새로 추가] 디지털 기준 색상표 데이터 로드
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
# 💡 [핵심] YOLO-OpenCV 좌표 변환 함수
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
# 2. OpenCV 이미지 보정 함수 (1, 2단계)
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

    # 4. 마커 좌표 순서 정렬 (좌상단, 우상단, 우하단, 좌하단)
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
# 📌 [새로 추가] 사용자 이미지에서 기준 색상표 추출
# ======================================================================
def extract_reference_colors_from_image(warped_image, digital_reference):
    
    print("--- [OpenCV] 사용자 이미지에서 기준 색상표 추출 시작 ---", file=sys.stderr)
    
    # --- 1. [수정] 변수 정의를 맨 앞으로 이동 ---
    pad_width = 20
    pad_height = 20
    
    reference_palette_positions = {
        "Urobilinogen": {"row_y": 65, "colors": [
            {"value": "0.1", "x": 180},
            {"value": "2", "x": 205},
            {"value": "4", "x": 230},
            {"value": "8", "x": 255}
        ]},
        "Glucose": {"row_y": 90, "colors": [
            {"value": "neg", "x": 180},
            {"value": "100", "x": 205},
            {"value": "250", "x": 230},
            {"value": "500", "x": 255},
            {"value": "1000", "x": 280}
        ]},
        "Bilirubin": {"row_y": 115, "colors": [
            {"value": "neg", "x": 205},
            {"value": "+", "x": 230},
            {"value": "++", "x": 255},
            {"value": "+++", "x": 280}
        ]},
        "Ketones": {"row_y": 140, "colors": [
            {"value": "neg", "x": 180},
            {"value": "5", "x": 205},
            {"value": "15", "x": 230},
            {"value": "40", "x": 255}
        ]},
        "Specific_Gravity": {"row_y": 165, "colors": [
            {"value": "1.000", "x": 180},
            {"value": "1.010", "x": 205},
            {"value": "1.020", "x": 230},
            {"value": "1.030", "x": 255},
            {"value": "1.040", "x": 280},
            {"value": "1.050", "x": 305}
        ]},
        "Blood": {"row_y": 195, "colors": [
            {"value": "neg", "x": 180},
            {"value": "+10", "x": 205},
            {"value": "++50", "x": 230},
            {"value": "+++250", "x": 255}
        ]},
        "pH": {"row_y": 220, "colors": [
            {"value": "5", "x": 180},
            {"value": "6", "x": 205},
            {"value": "6.5", "x": 230},
            {"value": "7", "x": 255},
            {"value": "8", "x": 280},
            {"value": "9", "x": 305}
        ]},
        "Protein": {"row_y": 245, "colors": [
            {"value": "neg", "x": 180},
            {"value": "trace", "x": 205},
            {"value": "30", "x": 230},
            {"value": "100", "x": 255},
            {"value": "300", "x": 280}
        ]},
        "Nitrite": {"row_y": 275, "colors": [
            {"value": "neg", "x": 180},
            {"value": "pos", "x": 205}
        ]},
        "Leukocytes": {"row_y": 300, "colors": [
            {"value": "neg", "x": 180},
            {"value": "25", "x": 205},
            {"value": "75", "x": 230},
            {"value": "500", "x": 255}
        ]}
    }
    
    # 추출된 기준 색상표
    extracted_references = {}
    
    # --- 2. [수정] 디버깅 사각형 로직을 이 위치로 이동 ---
    for test_name, positions in reference_palette_positions.items():
        row_y = positions["row_y"]
        test_colors = []
        
        for color_info in positions["colors"]:
            x = color_info["x"]
            value = color_info["value"]
            
            # 📌 [디버깅] 추출되는 영역에 파란색 사각형 표시 (BGR: 파란색)
            cv2.rectangle(warped_image, 
                          (x, row_y), 
                          (x + pad_width, row_y + pad_height), 
                          (255, 0, 0), 2) 

            # ROI 추출 (중앙 70% 사용)
            margin = int(pad_width * 0.15)
            roi = warped_image[
                row_y + margin : row_y + pad_height - margin,
                x + margin : x + pad_width - margin
            ]
            
            if roi.size == 0:
                print(f"[WARNING] {test_name} - {value} ROI 추출 실패", file=sys.stderr)
                continue
            
            # LAB 색상 추출
            lab_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2LAB)
            mean_lab = np.mean(lab_roi, axis=(0, 1))
            
            test_colors.append({
                "value": value,
                "lab": [float(mean_lab[0]), float(mean_lab[1]), float(mean_lab[2])]
            })
        
        extracted_references[test_name] = test_colors
        print(f"[INFO] {test_name}: {len(test_colors)}개 기준 색상 추출", file=sys.stderr)
    
    print("--- [OpenCV] 기준 색상표 추출 완료 ---", file=sys.stderr)
    return extracted_references

# ======================================================================
# 📌 [새로 추가] 회색 직사각형 색상 보정
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
    """
    색상 보정 계수 계산
    회색이 중립값(128, 128, 128)이 되도록 보정
    """
    if measured_gray is None:
        return [1.0, 0.0, 0.0]  # 보정 없음
    
    expected_gray = np.array([128.0, 128.0, 128.0])  # OpenCV LAB 스케일
    
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
# 4. OpenCV 색상 추출 함수
# ----------------------------------------------------------------------
def extract_lab_color(image_warped, box_pixel, center_ratio=0.7):
    """
    보정된 이미지에서 주어진 픽셀 좌표(바운딩 박스) 내의
    중앙 70% 영역의 평균 LAB 색상 값을 추출합니다.
    """
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

    # BGR -> LAB
    lab_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2LAB)
    mean_lab = np.mean(lab_roi, axis=(0, 1))

    return [float(mean_lab[0]), float(mean_lab[1]), float(mean_lab[2])]

# ----------------------------------------------------------------------
# 5. Delta E 계산 및 진단 
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
    """
    측정된 LAB 값과 사용자 이미지에서 추출한 기준 색상을 비교합니다.
    """
    if class_name not in extracted_references:
        return {
            "result": "진단 불가 (기준 색상 없음)",
            "delta_e": None,
            "matched_value": None
        }

    reference_colors = extracted_references[class_name]
    
    best_match = None
    min_delta_e = float('inf')
    
    # 측정된 색상과 기준표의 모든 색상 비교
    for ref in reference_colors:
        ref_lab = ref['lab']
        delta_e = calculate_delta_e(measured_lab, ref_lab)
        
        if delta_e < min_delta_e:
            min_delta_e = delta_e
            best_match = ref
    
    # 디지털 기준표에서 메타데이터 가져오기 (정상/비정상 등)
    metadata = get_metadata_from_digital_reference(class_name, best_match['value'], digital_reference)
    
    return {
        "matched_value": best_match['value'],
        "delta_e": round(min_delta_e, 2),
        "result": metadata.get('result', 'unknown'),
        "is_normal": metadata.get('is_normal', False),
        "severity": metadata.get('severity', 'N/A')
    }

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
# 6. 메인 분석 파이프라인
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

    # 📌 3. 사용자 이미지에서 기준 색상표 추출
    extracted_references = extract_reference_colors_from_image(processed_image, digital_reference)
    
    # 📌 3-1. 회색 영역 추출 및 색상 보정 계수 계산
    measured_gray = extract_gray_reference(processed_image)
    color_correction = calculate_color_correction(measured_gray)
    
    # 4. YOLO 모델 로드
    model_path = os.path.join(os.path.dirname(__file__), 'weights', 'best.pt') 
    # Docker용 경로
    # model_path = os.path.join('/app', 'weights', 'best.pt')
    model = YOLO(model_path)
    
    # 5. YOLO 추론 (검사 스틱의 패드 찾기)
    results = model(processed_image, verbose=False) 
    
    # 6. 탐지 결과 처리 및 진단
    pad_results = []
    # analyze_corrected.py 파일 수정 (주요 부분만)

    # 6-1. 디버깅용 이미지 생성
    debug_image = processed_image.copy()

    for r in results:
        boxes = r.boxes.xywhn.cpu().numpy() 
        confidences = r.boxes.conf.cpu().numpy()
        classes = r.boxes.cls.cpu().numpy()

        for box_norm, conf, cls_id in zip(boxes, confidences, classes):
            class_name = model.names[int(cls_id)]
            
            # 🔧 YOLO 클래스 이름에서 'pad_' 접두사 제거
            # 예: "pad_Bilirubin" → "Bilirubin"
            test_name = class_name.replace("pad_", "")
            
            # 🔧 클래스 이름 매핑 (약어 → 전체 이름)
            name_mapping = {
                "SG": "Specific_Gravity",
                "Specific_Gravity": "Specific_Gravity",
                # 필요시 다른 매핑 추가
            }
            
            # 매핑 적용
            if test_name in name_mapping:
                test_name = name_mapping[test_name]
            
            # 픽셀 좌표 변환
            x_min, y_min, x_max, y_max = normalize_to_pixel_coords(box_norm, W_warped, H_warped)
            
            # 6-1. 디버깅용
            # 📌 (1) 패드 영역 시각화
            box_pixel = [x_min, y_min, x_max, y_max]
            cv2.rectangle(debug_image, (x_min, y_min), (x_max, y_max), (0, 0, 255), 2) # 빨간색 테두리
            cv2.putText(debug_image, test_name, (x_min, y_min - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)

            # 📌 (2) 색상 추출 중앙 70% 영역 시각화 (선택 사항)
            # extract_lab_color 함수의 ROI 계산 로직을 이용하여 
            # 중앙 70% 영역에 다른 색상(예: 초록색) 테두리 추가 가능.

            # 패드 색상 추출
            measured_lab = extract_lab_color(processed_image, [x_min, y_min, x_max, y_max])
            
            # 📌 색상 보정 적용
            corrected_lab = apply_color_correction(measured_lab, color_correction)
            
            # 📌 진단: 사용자 이미지의 기준 색상표와 비교
            # test_name 사용 (pad_ 제거된 이름)
            diagnosis_info = perform_diagnosis(test_name, corrected_lab, 
                                              extracted_references, digital_reference)

            pad_results.append({
                "class": class_name,
                "confidence": round(float(conf), 4),
                "box_pixel": [int(x_min), int(y_min), int(x_max), int(y_max)],
                "lab_measured": [round(x, 2) for x in measured_lab],
                "lab_corrected": [round(x, 2) for x in corrected_lab],
                "diagnosis": diagnosis_info
            })
    
    # 7. 최종 결과
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
        # ----------------------------------------------------------------------
    # [추가] 6-1. 최종 결과 직전에 디버깅 이미지 저장
    # ----------------------------------------------------------------------
    # (analyze_image_pipeline 함수 맨 끝)
    cv2.imwrite("debug_visualization_output.png", debug_image) # 디버깅 이미지 저장
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
