# find_strip_pads.py (자동 비율 계산 + 디버깅 모드)

import cv2
import numpy as np

# --- 1단계: Phase 2 이미지 로드 ---
image_filename = "test_strip.jpg"
image = cv2.imread(image_filename)

if image is None:
    print(f"'{image_filename}' 이미지를 찾을 수 없습니다.")
else:
    # --- 2단계: 'test_strip.jpg'의 원본 좌표 ---
    # (주의!) find_coords.py로 '정확하게' 다시 찾은 4개 좌표로 바꿔주세요!
    pts_src = np.array([
        [120, 100],  # 예: 왼쪽 위
        [850, 95],   # 예: 오른쪽 위
        [855, 300],  # 예: 오른쪽 아래
        [115, 305]   # 예: 왼쪽 아래
    ], dtype=np.float32)

    # --- 3단계: ★★★ 자동 비율 계산 ★★★ ---
    (tl, tr, br, bl) = pts_src
    width_top = np.linalg.norm(tr - tl)
    width_bottom = np.linalg.norm(br - bl)
    max_width = int(max(width_top, width_bottom))
    
    height_left = np.linalg.norm(bl - tl)
    height_right = np.linalg.norm(br - tr)
    max_height = int(max(height_left, height_right))

    # 비율 계산
    aspect_ratio = max_height / max_width
    
    width = 600 # 가로는 600으로 고정
    height = int(width * aspect_ratio) # 세로는 비율에 맞게 자동 계산

    print(f"변환될 이미지 크기 (자동 계산됨): w={width}, h={height}")

    pts_dst = np.array([
        [0, 0], [width - 1, 0], [width - 1, height - 1], [0, height - 1]
    ], dtype=np.float32)
    
    # --- 4단계: 변환 실행 ---
    matrix = cv2.getPerspectiveTransform(pts_src, pts_dst)
    image_warped = cv2.warpPerspective(image, matrix, (width, height))
    
    # --- 5단계: 전처리 (adaptiveThreshold) ---
    gray = cv2.cvtColor(image_warped, cv2.COLOR_BGR2GRAY)
    thresh = cv2.adaptiveThreshold(gray, 255, 
                                    cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                    cv2.THRESH_BINARY_INV, 
                                    15, 4)
    
    # --- 6단계: 경계 검출 (findContours) ---
    contours, hierarchy = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    print(f"총 {len(contours)}개의 물체(경계)를 찾았습니다.")

    # --- 7단계: 디버깅 모드 (필터 값 찾기) ---
    image_debug = image_warped.copy()
    
    # (넓은 필터 값 - 튜닝 불필요)
    STRIP_Y_MIN = 0
    STRIP_Y_MAX = height
    SHAPE_W_MIN = 5 # (w=6, w=8 같은 패드도 잡기 위해 5로 낮춤)
    SHAPE_W_MAX = 100
    SHAPE_H_MIN = 5 # (h=8 같은 패드도 잡기 위해 5로 낮춤)
    SHAPE_H_MAX = 150 # (h=122 팔레트도 잡기 위해 150으로 높임)

    print("\n--- [디버깅] 감지된 모든 물체 (필터링 전) ---")
    print("x, y, w(너비), h(높이)")
    
    detected_objects = []

    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        print(f"x={x}, y={y}, w={w}, h={h}")

        is_in_strip_area = (y > STRIP_Y_MIN) and (y < STRIP_Y_MAX)
        is_pad_shape = (w > SHAPE_W_MIN) and (w < SHAPE_W_MAX) and (h > SHAPE_H_MIN) and (h < SHAPE_H_MAX)
        
        if is_in_strip_area and is_pad_shape:
            # 필터 통과한 객체만 사각형 그리고, 리스트에 추가
            cv2.rectangle(image_debug, (x, y), (x + w, y + h), (255, 0, 0), 2) # 파란색
            detected_objects.append((x,y,w,h))

    print(f"\n넓은 필터로 총 {len(detected_objects)}개의 물체를 찾았습니다.")

    # --- 9단계: 결과 보여주기 ---
    cv2.imshow("Warped Image (Auto-Ratio) - DEBUG", image_debug)
    cv2.waitKey(0)
    cv2.destroyAllWindows()