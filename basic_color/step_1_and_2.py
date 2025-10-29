# step_1_and_2.py

import cv2
import numpy as np

# --- [1단계] 표준화 ---
image_filename = "test_strip.jpg"
image = cv2.imread(image_filename)

if image is None:
    print(f"'{image_filename}' 이미지를 찾을 수 없습니다.")
else:
    # (★ 멘토님이 주신 '기준 색상표 모서리' 4개 좌표)
    pts_src_chart = np.array([
        [89, 139],   # 왼쪽 위
        [942, 133],  # 오른쪽 위
        [940, 430],  # 오른쪽 아래
        [85, 429]    # 왼쪽 아래
    ], dtype=np.float32)

    # (자동 비율 계산 로직)
    (tl, tr, br, bl) = pts_src_chart
    width_top = np.linalg.norm(tr - tl); width_bottom = np.linalg.norm(br - bl)
    max_width = int(max(width_top, width_bottom))
    height_left = np.linalg.norm(bl - tl); height_right = np.linalg.norm(br - tr)
    max_height = int(max(height_left, height_right))
    aspect_ratio = max_height / max_width
    width = 600
    height = int(width * aspect_ratio)
    pts_dst = np.array([[0, 0], [width - 1, 0], [width - 1, height - 1], [0, height - 1]], dtype=np.float32)
    
    print(f"표준화 이미지 크기: w={width}, h={height}")

    matrix = cv2.getPerspectiveTransform(pts_src_chart, pts_dst)
    image_warped = cv2.warpPerspective(image, matrix, (width, height))
    
    # --- [2단계] '기준 팔레트' 위치 찾기 ---
    
    # 5단계 (전처리)
    gray = cv2.cvtColor(image_warped, cv2.COLOR_BGR2GRAY)
    thresh = cv2.adaptiveThreshold(gray, 255, 
                                    cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                    cv2.THRESH_BINARY_INV, 
                                    15, 4)
    
    # 6단계 (경계 검출)
    contours, hierarchy = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    print(f"총 {len(contours)}개의 물체(경계)를 찾았습니다.")

    # 7단계 (팔레트 필터링)
    image_debug = image_warped.copy()
    palette_rois = []

    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        
        # (★ 이 필터 값은 튜닝이 필요합니다!)
        # (예: w=20~40, h=40~60 사이의 '팔레트' 모양만 찾기)
        is_palette_shape = (w > 20) and (h > 40) and (w < 50) and (h < 70)
        
        # '스틱 영역' (예: y=150~200)은 '제외'
        is_not_strip = (y < 150) or (y > 200) # (★ 튜닝 필요)

        if is_palette_shape and is_not_strip:
            # (필터 통과) '기준 팔레트'로 간주
            cv2.rectangle(image_debug, (x, y), (x + w, y + h), (0, 255, 0), 2) # 초록색
            palette_rois.append((x, y, w, h))

    print(f"총 {len(palette_rois)}개의 '기준 팔레트'를 찾았습니다.")

    # 8단계 (결과 보여주기)
    cv2.imshow("Step 1 & 2: Finding Baseline Palettes", image_debug)
    cv2.waitKey(0)
    cv2.destroyAllWindows()