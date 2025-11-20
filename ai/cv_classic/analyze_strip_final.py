# analyze_strip_final.py
# (멘토님의 전략: 차트 모서리 1개로 스틱 모서리를 '자동 계산'하는 버전)

import cv2
import numpy as np

# --- 0단계: ★★★ 미리 계산된 '비율' 상수 ★★★ ---
# (멘토님이 주신 샘플 좌표로 제가 미리 계산해둔 '고정 비율'입니다)
# (기준 차트를 (0,0)~(1,1) 단위 사각형으로 봤을 때의 스틱 모서리 상대 (u,v) 좌표)
STRIP_CORNERS_NORMALIZED = np.array([
    [0.1340, -0.3644], # 스틱 왼쪽 위
    [0.8521, -0.4208], # 스틱 오른쪽 위
    [0.8541,  0.5898], # 스틱 오른쪽 아래
    [0.1300,  0.5516]  # 스틱 왼쪽 아래
], dtype=np.float32)

# (Lesson 13에서 튜닝해야 할 '스틱 내부 격자' 상수)
PAD_COUNT = 10
START_X = 30
PAD_Y = 5
PAD_WIDTH = 30
PAD_HEIGHT = 40
PAD_GAP = 55
# (스틱을 600x50 크기로 펴기로 약속)
STRIP_WIDTH = 600
STRIP_HEIGHT = 50


# --- 1단계: Phase 2 이미지 로드 ---
image_filename = "test_strip.jpg"
image = cv2.imread(image_filename)

if image is None:
    print(f"'{image_filename}' 이미지를 찾을 수 없습니다.")
else:
    # --- 2단계: '기준 색상표'의 원본 좌표 ---
    # (★ 사용자가 유일하게 입력하는 4개의 '차트' 모서리 좌표)
    pts_src_chart = np.array([
        [89, 139],   # 왼쪽 위
        [942, 133],  # 오른쪽 위
        [940, 430],  # 오른쪽 아래
        [85, 429]    # 왼쪽 아래
    ], dtype=np.float32)

    # --- 3단계: ★★★ '스틱' 모서리 자동 계산 ★★★ ---
    
    # (0,0)~(1,1)의 '단위 사각형' 정의
    pts_unit_square = np.array([[0,0], [1,0], [1,1], [0,1]], dtype=np.float32)

    # '단위 사각형' -> '기준 색상표'로 되돌리는 변환 행렬 M을 찾습니다.
    # (즉, 0.1을 곱하면 x좌표 89 근처가 나오는 공식)
    matrix_to_chart = cv2.getPerspectiveTransform(pts_unit_square, pts_src_chart)
    
    # 0단계의 '비율 상수'에 '변환 행렬 M'을 적용해
    # '스틱 모서리'의 원본 좌표 4개를 '자동으로 계산'합니다.
    # (cv2.perspectiveTransform은 (N, 1, 2) 형태의 입력이 필요)
    pts_src_strip_calculated = cv2.perspectiveTransform(
        STRIP_CORNERS_NORMALIZED.reshape(-1, 1, 2), 
        matrix_to_chart
    )
    
    # (디버깅 출력)
    # print("--- 자동으로 계산된 스틱 모서리 좌표 ---")
    # print(pts_src_strip_calculated)

    # --- 4단계: '스틱 전용' 표준화 (Lesson 12 재활용) ---
    
    # '스틱'의 목적지 좌표 (600x50 크기)
    pts_dst_strip = np.array([
        [0, 0], [STRIP_WIDTH - 1, 0], 
        [STRIP_WIDTH - 1, STRIP_HEIGHT - 1], [0, STRIP_HEIGHT - 1]
    ], dtype=np.float32)
    
    # (1) '계산된' 스틱 원본 좌표 -> (2) '목표' 스틱 좌표
    matrix_strip = cv2.getPerspectiveTransform(pts_src_strip_calculated, pts_dst_strip)
    image_warped_strip = cv2.warpPerspective(image, matrix_strip, (STRIP_WIDTH, STRIP_HEIGHT))

    # --- 5단계: 격자 기반 색상 추출 (Lesson 13 재활용) ---
    
    image_debug = image_warped_strip.copy()
    strip_lab_colors = [] # 최종 결과 (LAB 값 10개)

    print("\n--- [Phase 2] 검출된 스틱 패드 색상 (LAB) ---")

    for i in range(PAD_COUNT):
        current_x = START_X + (i * PAD_GAP)
        cv2.rectangle(image_debug, 
                      (current_x, PAD_Y), 
                      (current_x + PAD_WIDTH, PAD_Y + PAD_HEIGHT), 
                      (0, 0, 255), 2)
        
        pad_roi = image_warped_strip[PAD_Y : PAD_Y + PAD_HEIGHT, 
                                     current_x : current_x + PAD_WIDTH]
        
        avg_bgr_color = cv2.mean(pad_roi)[:3]
        bgr_pixel_image = np.array([[avg_bgr_color]], dtype=np.uint8)
        lab_pixel_image = cv2.cvtColor(bgr_pixel_image, cv2.COLOR_BGR2LAB)
        avg_lab_color = lab_pixel_image[0][0]
        
        strip_lab_colors.append([int(c) for c in avg_lab_color])
        print(f"패드 #{i+1} (x={current_x}): L={avg_lab_color[0]}, a={avg_lab_color[1]}, b={avg_lab_color[2]}")

    
    # --- 6단계: 결과 보여주기 ---
    cv2.imshow("Warped Strip (Auto-Calculated)", image_debug)
    cv2.waitKey(0)
    cv2.destroyAllWindows()