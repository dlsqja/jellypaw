# analyze_final.py

import cv2
import numpy as np

def get_lab_color(image, x, y, w, h):
    """지정된 좌표(ROI)의 평균 LAB 색상 값을 반환합니다."""
    pad_roi = image[y:y+h, x:x+w]
    if pad_roi.size == 0:
        return np.array([0, 0, 0])
    avg_bgr_color = cv2.mean(pad_roi)[:3]
    bgr_pixel_image = np.array([[avg_bgr_color]], dtype=np.uint8)
    lab_pixel_image = cv2.cvtColor(bgr_pixel_image, cv2.COLOR_BGR2LAB)
    return lab_pixel_image[0][0] # [L, a, b]

# --- [1단계] 표준화 ---
image_filename = "test_strip.jpg"
image = cv2.imread(image_filename)

if image is None:
    print(f"'{image_filename}' 이미지를 찾을 수 없습니다.")
else:
    pts_src_chart = np.array([
        [50, 93],   # 왼쪽 위
        [913, 90],  # 오른쪽 위
        [918, 386],  # 오른쪽 아래
        [47, 392]    # 왼쪽 아래
    ], dtype=np.float32)

    # (자동 비율 계산 로직)
    (tl, tr, br, bl) = pts_src_chart
    width_top = np.linalg.norm(tr - tl); width_bottom = np.linalg.norm(br - bl)
    max_width = int(max(width_top, width_bottom))
    height_left = np.linalg.norm(bl - tl); height_right = np.linalg.norm(br - tr)
    max_height = int(max(height_left, height_right))
    aspect_ratio = max_height / max_width
    width = 600
    height = int(width * aspect_ratio) # (h=205 근처가 될겁니다)
    
    print(f"표준화 이미지 크기: w={width}, h={height}")

    pts_dst = np.array([[0, 0], [width - 1, 0], [width - 1, height - 1], [0, height - 1]], dtype=np.float32)
    
    matrix = cv2.getPerspectiveTransform(pts_src_chart, pts_dst)
    image_warped = cv2.warpPerspective(image, matrix, (width, height))
    
    # --- [2, 3단계] '기준 팔레트' (findContours) ---
    gray = cv2.cvtColor(image_warped, cv2.COLOR_BGR2GRAY)
    thresh = cv2.adaptiveThreshold(gray, 255, 
                                    cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                    cv2.THRESH_BINARY_INV, 
                                    15, 4)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    image_debug = image_warped.copy()
    baseline_palette_labs = [] # [3단계] 기준 DB
    strip_pad_labs = []        # [6단계] 스틱 LAB 값

    # (팔레트 크기 필터 - h=205 이미지 기준 튜닝 필요)
    PALETTE_W = (25, 40); PALETTE_H = (45, 55)

    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        
        # (크기 필터)
        if (PALETTE_W[0] < w < PALETTE_W[1]) and (PALETTE_H[0] < h < PALETTE_H[1]):
            # (Y좌표 필터: 윗줄/아랫줄만)
            if (y < height * 0.3) or (y > height * 0.6): # (위 30% 또는 아래 30% 영역)
                lab_val = get_lab_color(image_warped, x, y, w, h)
                baseline_palette_labs.append( (x, y, lab_val) )
                cv2.rectangle(image_debug, (x, y), (x + w, y + h), (0, 255, 0), 2) # 초록색
    
    # --- [5, 6단계] '소변 스틱' (Hough Lines + HSV Mask) ---
    
    # [5-1] '선 검출'로 스틱의 Y 경계 '자동' 찾기
    edges = cv2.Canny(gray, 50, 150)
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=30, minLineLength=100, maxLineGap=10)

    horizontal_lines_y = []
    if lines is not None:
        for line in lines:
            x1, y1, x2, y2 = line[0]
            if abs(y1 - y2) < 5: 
                horizontal_lines_y.append((y1 + y2) // 2)
    
    Y_CENTER_GUESS = height // 2
    stick_lines_y = [y for y in horizontal_lines_y if abs(y - Y_CENTER_GUESS) < (height * 0.25)] 

    if len(stick_lines_y) < 2:
        print("!!! 오류: 스틱의 위/아래 '수평선'을 자동으로 찾지 못했습니다.")
        strip_area_y_start, strip_area_y_end = Y_CENTER_GUESS - 20, Y_CENTER_GUESS + 20
    else:
        strip_area_y_start = min(stick_lines_y) - 5 # 5px 여유
        strip_area_y_end = max(stick_lines_y) + 5   # 5px 여유
        print(f"스틱 영역 '자동 검출' 성공: y={strip_area_y_start} ~ {strip_area_y_end}")

    # [5-2] '자동'으로 찾은 Y 경계로 스틱 영역 잘라내기
    strip_roi_image = image_warped[strip_area_y_start:strip_area_y_end, 0:width]
    
    if strip_roi_image.size == 0:
         print("!!! 오류: 스틱 영역을 잘라내지 못했습니다. Y좌표를 확인하세요.")
    else:
        # [5-3] (새 전처리 1) 흑백(Grayscale) 변환
        strip_gray = cv2.cvtColor(strip_roi_image, cv2.COLOR_BGR2GRAY)
        
        # [5-4] (새 전처리 2) CLAHE (대비 제한 적응형 히스토그램 평활화)
        # clipLimit=2.0: 대비(contrast)를 최대 2배까지만 증폭 (노이즈 방지)
        # tileGridSize=(4,4): 이미지를 4x4 격자로 나눠서 국소적으로 대비 향상
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(4, 4))
        strip_clahe = clahe.apply(strip_gray)

        # [5-5] (새 전처리 3) 'CLAHE' 이미지에 '튜닝된' adaptiveThreshold 적용
        
        # (blockSize=21: 21x21의 넓은 영역을 봄)
        # (C=7: ★★★ 민감도 수정 (3 -> 7) ★★★)
        # (주변 평균보다 7만큼 어두워야만 물체(흰색)로 인정)
        strip_thresh_noisy = cv2.adaptiveThreshold(strip_clahe, 255, 
                                            cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                            cv2.THRESH_BINARY_INV, 
                                            21, 7)
        
        # ★★★ [5-5-B] (새 전처리 4) '모폴로지'로 노이즈 청소 ★★★
        kernel = np.ones((3,3), np.uint8)
        strip_thresh = cv2.morphologyEx(strip_thresh_noisy, cv2.MORPH_OPEN, kernel, iterations=1)
        
        # (디버깅) 3개의 전처리 창 띄우기
        cv2.imshow("1. Strip Gray", strip_gray)
        cv2.imshow("2. Strip CLAHE (Contrast Boosted)", strip_clahe)
        cv2.imshow("3. Strip Threshold (C=7)", strip_thresh) # <- 창 이름 변경
        cv2.imshow("4. Strip Mask (Cleaned)", strip_thresh)       # <- '청소된' 버전

        # [5-6] '최종 스레시'에서 'findContours' 실행
        pad_contours, _ = cv2.findContours(strip_thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        # ...
        print(f"\n--- [6단계] 소변 스틱 LAB (CLAHE 방식) ---")
        print(f"총 {len(pad_contours)}개의 패드 후보를 찾았습니다.")
        
        image_debug_strip = strip_roi_image.copy()
        
        # [5-7] 크기 필터
        STRIP_W = (15, 40); STRIP_H = (15, strip_area_y_end - strip_area_y_start)
        for cnt in pad_contours:
            x, y, w, h = cv2.boundingRect(cnt)
            if (STRIP_W[0] < w < STRIP_W[1]) and (STRIP_H[0] < h < STRIP_H[1]):
                abs_y = y + strip_area_y_start 
                lab_val = get_lab_color(image_warped, x, abs_y, w, h)
                strip_pad_labs.append( (x, lab_val) )
                cv2.rectangle(image_debug_strip, (x, y), (x+w, y+h), (0, 0, 255), 2)
    # --- [7단계] 준비 완료: 결과 출력 ---
    baseline_palette_labs.sort(key=lambda p: (p[1], p[0])) # y, x 순
    strip_pad_labs.sort(key=lambda p: p[0]) # x 순

    print(f"\n--- [3단계] 기준 팔레트 LAB ({len(baseline_palette_labs)}개) ---")
    print(f"\n--- [6단계] 소변 스틱 LAB ({len(strip_pad_labs)}개) ---")
    
    cv2.imshow("FINAL (Hough+HSV Hybrid)", image_debug) # 전체 이미지
    cv2.waitKey(0)
    cv2.destroyAllWindows()