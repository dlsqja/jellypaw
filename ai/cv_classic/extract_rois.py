import cv2
import numpy as np

image_filename = "test_kit.png"
image = cv2.imread(image_filename)

if image is None:
    print("이미지를 찾을 수 없습니다.")
else:
    # --- 1단계: 원본 좌표 (Source Points) ---
    # 방금 find_coords.py로 찾은 4개의 좌표를 여기에 입력하세요!
    # 순서: [왼쪽-위, 오른쪽-위, 오른쪽-아래, 왼쪽-아래]
    # (주의: 예시 좌표이며, 실제 찾은 값으로 바꿔야 합니다)
    pts_src = np.array([
        [89, 139],  # 예: 왼쪽 위
        [942, 133],   # 예: 오른쪽 위
        [940, 430],  # 예: 오른쪽 아래
        [85, 429]   # 예: 왼쪽 아래
    ], dtype=np.float32)

    # --- 2단계: 목적지 좌표 (Destination Points) ---
    # 결과 이미지를 얼마나 크게 만들지 정의합니다.
    # (가로 600픽셀, 세로 200픽셀 크기의 직사각형으로 만듦)
    width = 600
    height = 200
    
    pts_dst = np.array([
        [0, 0],             # 왼쪽 위
        [width - 1, 0],     # 오른쪽 위
        [width - 1, height - 1], # 오른쪽 아래
        [0, height - 1]     # 왼쪽 아래
    ], dtype=np.float32)

    # --- 3단계: 변환 행렬 계산 ---
    # "pts_src를 pts_dst로 옮기는 변환 공식(행렬)을 찾아줘"
    matrix = cv2.getPerspectiveTransform(pts_src, pts_dst)

    # --- 4단계: 이미지 변환 실행 ---
    # "원본 이미지(image)에 위 공식(matrix)을 적용해서
    # (width, height) 크기로 이미지를 변형해줘"
    image_warped = cv2.warpPerspective(image, matrix, (width, height))

    # --- 5단계: 격자(Grid) 상수 정의 (이 부분만 수동 튜닝!) ---
    # (width=600, height=200 기준의 예시 값이므로,
    #  본인의 warped 이미지에 맞게 숫자를 직접 수정해야 합니다.)

    COLUMN_COUNT = 10     # 총 10개의 항목(컬럼)이 있습니다.
    UPPER_ROW_Y = 30      # 윗줄의 y 시작점
    LOWER_ROW_Y = 140     # 아랫줄의 y 시작점
    START_X = 50          # 첫 번째 항목의 x 시작점
    SWATCH_W = 30         # 각 항목의 너비
    SWATCH_H = 30         # 각 항목의 높이
    COLUMN_GAP = 40       # (예시) 다음 항목까지의 x 간격 (핵심 튜닝 값)
                        # (두 번째 항목 x좌표 - 첫 번째 항목 x좌표)


    # --- 6단계: 'for' 반복문으로 ROI 계산 및 시각화 ---
    image_debug = image_warped.copy()
    all_rois = {} # 나중에 색상값을 저장할 딕셔너리

    print(f"총 {COLUMN_COUNT}개의 항목(컬럼)을 계산합니다...")

    for i in range(COLUMN_COUNT):
        # i = 0일 때: 1번째 항목
        # i = 1일 때: 2번째 항목 ...
        
        # 현재 항목의 x 좌표 계산
        current_x = START_X + (i * COLUMN_GAP)

        # (1) 윗줄의 ROI 좌표 계산 및 사각형 그리기
        upper_x = current_x
        upper_y = UPPER_ROW_Y
        # (x1, y1)은 왼쪽 위, (x2, y2)는 오른쪽 아래
        cv2.rectangle(image_debug, 
                    (upper_x, upper_y), 
                    (upper_x + SWATCH_W, upper_y + SWATCH_H), 
                    (0, 255, 0),  # 초록색
                    2)

        # (2) 아랫줄의 ROI 좌표 계산 및 사각형 그리기
        lower_x = current_x
        lower_y = LOWER_ROW_Y
        cv2.rectangle(image_debug, 
                    (lower_x, lower_y), 
                    (lower_x + SWATCH_W, lower_y + SWATCH_H), 
                    (255, 0, 0),  # 파란색
                    2)

    # --- 7단계: 결과 보여주기 ---
    cv2.imshow("Warped Image with GRID", image_debug)

    print("격자(Grid)가 모든 색상 칸에 잘 맞는지 확인하세요.")
    print("위치가 안 맞으면 5단계의 상수(GAP, START_X 등)를 수정하세요.")
    cv2.waitKey(0)
    cv2.destroyAllWindows()