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
        [45, 97],  # 예: 왼쪽 위
        [917, 91],   # 예: 오른쪽 위
        [921, 401],  # 예: 오른쪽 아래
        [45, 393]   # 예: 왼쪽 아래
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

    # --- 5단계: 결과 보여주기 ---
    cv2.imshow("Original Image", image)
    cv2.imshow("Warped (Standardized) Image", image_warped)
    
    print("변환 성공! 아무 키나 누르면 종료됩니다.")
    cv2.waitKey(0)
    cv2.destroyAllWindows()