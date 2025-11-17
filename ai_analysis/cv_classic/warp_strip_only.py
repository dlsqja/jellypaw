# warp_strip_only.py
# (오직 '스틱'만 펴는 전용 스크립트)

import cv2
import numpy as np

image_filename = "test_strip.jpg"
image = cv2.imread(image_filename)

if image is None:
    print(f"'{image_filename}' 이미지를 찾을 수 없습니다.")
else:
    # --- 2단계: '스틱'의 원본 좌표 ---
    # (★ 1단계에서 찾은 '스틱'의 4개 좌표를 여기에 붙여넣으세요!)
    pts_src = np.array([
        [75, 209],  # 예: 스틱의 왼쪽 위
        [854, 202],  # 예: 스틱의 오른쪽 위
        [858, 269],  # 예: 스틱의 오른쪽 아래
        [78, 282]   # 예: 스틱의 왼쪽 아래
    ], dtype=np.float32)

    # --- 3단계: ★★★ '스틱'의 목적지 크기 (새로 정의) ★★★ ---
    # 우리는 스틱을 '표준화된' 길고 얇은 직사각형으로 만들 겁니다.
    # (자동 비율 계산이 필요 없습니다)
    
    STRIP_WIDTH = 600  # 표준 스틱 가로 길이
    STRIP_HEIGHT = 50  # 표준 스틱 세로 높이

    pts_dst = np.array([
        [0, 0],
        [STRIP_WIDTH - 1, 0],
        [STRIP_WIDTH - 1, STRIP_HEIGHT - 1],
        [0, STRIP_HEIGHT - 1]
    ], dtype=np.float32)
    
    # --- 4단계: 변환 실행 ---
    matrix = cv2.getPerspectiveTransform(pts_src, pts_dst)
    # (STRIP_WIDTH, STRIP_HEIGHT) 크기로 이미지를 강제 변환
    image_warped_strip = cv2.warpPerspective(image, matrix, (STRIP_WIDTH, STRIP_HEIGHT))
    
    # --- 5단계: 결과 보여주기 ---
    cv2.imshow("Original Image", image)
    cv2.imshow("Warped Strip ONLY", image_warped_strip) # ★ 결과물
    
    print("결과 이미지가 '길고 얇은 스틱' 모양으로 펴졌는지 확인하세요.")
    cv2.waitKey(0)
    cv2.destroyAllWindows()