import sys
import os
import json
import cv2
from ultralytics import YOLO
import numpy as np
from json import JSONEncoder

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

# ----------------------------------------------------------------------
# 💡 [핵심] YOLO-OpenCV 좌표 변환 함수
# ----------------------------------------------------------------------
def normalize_to_pixel_coords(box_normalized, image_width, image_height):
    """
    YOLO 정규화된 좌표(x_center, y_center, width, height)를 
    OpenCV 픽셀 좌표(x_min, y_min, x_max, y_max)로 변환합니다.
    """
    x_center, y_center, w_norm, h_norm = box_normalized
    
    # 픽셀 단위로 변환
    x_center_px = x_center * image_width
    y_center_px = y_center * image_height
    width_px = w_norm * image_width
    height_px = h_norm * image_height
    
    # 최소/최대 좌표 계산 (OpenCV 바운딩 박스 형식)
    x_min = int(x_center_px - width_px / 2)
    y_min = int(y_center_px - height_px / 2)
    x_max = int(x_center_px + width_px / 2)
    y_max = int(y_center_px + height_px / 2)
    
    return [x_min, y_min, x_max, y_max]

# ----------------------------------------------------------------------
# 2. OpenCV 이미지 보정 함수 (1, 2단계)
# ----------------------------------------------------------------------
def perform_warp_perspective(image):
    # (생략: 기존 코드와 동일. 마커 탐지 및 투시 변환 수행)
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
        print(f"--- [OpenCV ERROR] 4개의 마커를 정확히 찾지 못했습니다. 원본 이미지 반환. ---", file=sys.stderr)
        return image 

    # 4. 마커 좌표 순서 정렬 (좌상단, 우상단, 우하단, 좌하단)
    markers = np.array(marker_centers, dtype="float32")
    markers_sorted = markers[np.argsort(markers[:, 1])] 
    top = markers_sorted[:2][np.argsort(markers_sorted[:2, 0])]
    bottom = markers_sorted[2:][np.argsort(markers_sorted[2:, 0])]
    
    src_points = np.array([top[0], top[1], bottom[1], bottom[0]], dtype="float32")

    # 5. 목표 좌표 정의 (Destination Points)
    target_width = 600
    target_height = 1000
    
    dst_points = np.array([
        [0, 0], [target_width - 1, 0], 
        [target_width - 1, target_height - 1], [0, target_height - 1]
    ], dtype="float32")

    # 6. 투시 변환 실행
    M = cv2.getPerspectiveTransform(src_points, dst_points)
    warped_image = cv2.warpPerspective(image, M, (target_width, target_height))
    
    # 개발 모드 디버깅용 창 표시 (배포 시 이 부분은 반드시 주석 처리/제거해야 함)
    # print("--- [OpenCV] 이미지 보정 완료. 새 창에서 'warped_image'를 확인하세요. ---", file=sys.stderr)
    # cv2.imshow("Warped Image (Press any key to continue)", warped_image)
    # cv2.waitKey(0) 
    # cv2.destroyAllWindows()
    
    print("--- [OpenCV] 컨투어 기반 투시 보정 성공. ---", file=sys.stderr)
    return warped_image
    
# ----------------------------------------------------------------------
# 4. OpenCV 색상 추출 함수 (4단계)
# ----------------------------------------------------------------------
def extract_lab_color(image_warped, box_pixel):
    """
    보정된 이미지에서 주어진 픽셀 좌표(바운딩 박스) 내의
    평균 LAB 색상 값을 추출합니다.
    """
    x_min, y_min, x_max, y_max = box_pixel

    # 1. ROI (Region of Interest) 추출
    try:
        # y축(높이)이 먼저, x축(너비)이 나중에 옴: image[y_min:y_max, x_min:x_max]
        roi = image_warped[int(y_min):int(y_max), int(x_min):int(x_max)]
    except IndexError:
        print(f"--- [Color ERROR] ROI 추출 중 오류 발생: {box_pixel} ---", file=sys.stderr)
        return [0.0, 0.0, 0.0]

    if roi.size == 0 or roi.shape[0] < 1 or roi.shape[1] < 1:
        return [0.0, 0.0, 0.0]

    # 2. 색공간 변환: BGR -> LAB (OpenCV의 기본 색상 포맷은 BGR)
    lab_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2LAB)

    # 3. 평균 LAB 값 계산 [L, A, B]
    mean_lab = np.mean(lab_roi, axis=(0, 1))

    # 결과를 정밀도 높은 float 리스트로 변환
    return [round(float(val), 4) for val in mean_lab]

# ----------------------------------------------------------------------
# 5. 메인 분석 파이프라인 (3단계 + 4단계 통합)
# ----------------------------------------------------------------------
def analyze_image_pipeline(image_path):
    # 1. 파일 로드
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"이미지 파일을 로드할 수 없습니다: {image_path}")

    # 1, 2단계: 마커 탐지 및 이미지 보정
    processed_image = perform_warp_perspective(image)
    
    # 보정된 이미지의 크기
    H_warped, W_warped, _ = processed_image.shape

    # 👇👇👇 [누락된 코드 추가]: 디버깅 이미지 초기화 👇👇👇
    debug_image = processed_image.copy() 
    # 👆👆👆 [누락된 코드 추가] 👆👆👆
    
    # 3. YOLO 모델 로드
    model_path = os.path.join(os.path.dirname(__file__), 'weights', 'best.pt') 
    model = YOLO(model_path)
    
    # 3. YOLO 추론 실행 (보정된 이미지 사용)
    results = model(processed_image, verbose=False) 
    
    # 4. 탐지 결과 처리 및 색상 추출 (3단계 + 4단계)
    pad_results = []
    
    for r in results:
        # **주의: 여기서 xywhn은 보정된 이미지(W_warped, H_warped) 기준입니다.**
        boxes = r.boxes.xywhn.cpu().numpy() 
        confidences = r.boxes.conf.cpu().numpy()
        classes = r.boxes.cls.cpu().numpy()

        for box_norm, conf, cls_id in zip(boxes, confidences, classes):
            class_name = model.names[int(cls_id)]
            
            # 3단계: YOLO 좌표를 픽셀 좌표로 변환
            x_min, y_min, x_max, y_max = normalize_to_pixel_coords(box_norm, W_warped, H_warped)
            
            # 👇 4단계: LAB 색상 추출 로직 실행
            lab_color = extract_lab_color(processed_image, [x_min, y_min, x_max, y_max])
            
            # 패드 결과 리스트에 저장 (LAB 값 포함)
            pad_results.append({
                "class": class_name,
                "confidence": round(conf, 4),
                "box_pixel": [x_min, y_min, x_max, y_max],
                "lab_color": lab_color  # 💡 4단계 결과!
            })

            # # 👇👇👇 [디버깅 코드]: 이제 debug_image 변수가 정의되어 사용 가능 👇👇👇
            # # 1. 바운딩 박스 그리기
            # p1 = (x_min, y_min)
            # p2 = (x_max, y_max)
            # cv2.rectangle(debug_image, p1, p2, (0, 255, 0), 2)
            
            # # 2. 클래스 이름 표시
            # text = f"{class_name}" 
            # cv2.putText(debug_image, text, (x_min, y_min - 10), 
            #             cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            # # 👆👆👆 [디버깅 코드 끝] 👆👆👆
    
    # 5. 최종 결과 JSON 생성 (Skeleton)

    # # 👇👇👇 [디버깅 창 표시] 👇👇👇
    # print("--- [DEBUG] YOLO 탐지 결과 시각화 창을 띄웁니다. ---", file=sys.stderr)
    # cv2.imshow("YOLO Detections on Warped Image (Press any key to close)", debug_image)
    # cv2.waitKey(0) 
    # cv2.destroyAllWindows()
    # # 👆👆👆 [디버깅 창 표시] 👆👆👆


    final_result = {
        "status": "SUCCESS",
        "analysis_count": len(pad_results),
        "detections": pad_results,
        "diagnosis": {} 
    }
    
    return final_result

# ----------------------------------------------------------------------
# 스크립트 실행 (Spring 백엔드가 호출하는 부분)
# ----------------------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze_final.py <image_path>", file=sys.stderr)
        sys.exit(1)
        
    image_path = sys.argv[1]

    try:
        result_data = analyze_image_pipeline(image_path)
        print(json.dumps(result_data, indent=4, cls=NumpyEncoder))
        
    except Exception as e:
        error_output = {"status": "ERROR", "message": str(e), "path": image_path}
        print(json.dumps(error_output), file=sys.stderr)
        sys.exit(1)