# test_warp.py (표준화 전용 테스트 스크립트)

import cv2
import numpy as np

# --- 1단계: Phase 2 이미지 로드 ---
image_filename = "test_strip.jpg"
image = cv2.imread(image_filename)

if image is None:
    print(f"'{image_filename}' 이미지를 찾을 수 없습니다.")
else:
    # --- 2단계: 'test_strip.jpg'의 원본 좌표 ---
    # (★ 여기가 가장 중요합니다. find_coords.py로 찾은 '정확한' 값으로!)
    pts_src = np.array([
        [45, 97],  # 예: 왼쪽 위 (다시 찾아야 함)
        [917, 91],   # 예: 오른쪽 위 (다시 찾아야 함)
        [921, 401],  # 예: 오른쪽 아래 (다시 찾아야 함)
        [45, 393]   # 예: 왼쪽 아래 (다시 찾아야 함)
    ], dtype=np.float32)

    # --- 3단계: ★★★ 자동 비율 계산 ★★★ ---
    # (이 코드는 '내가 고른 꼭짓점'의 비율을 자동으로 계산합니다)
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
    
    # --- 5단계: 결과 보여주기 (오직 이것만!) ---
    cv2.imshow("Original Image", image) # 원본
    cv2.imshow("Warped (Auto-Ratio) TEST", image_warped) # 결과물
    
    print("결과 이미지가 '반듯하게' 펴졌는지 확인하세요.")
    print("문제가 있다면 2단계(pts_src) 좌표를 다시 찾아야 합니다.")
    print("아무 키나 누르면 종료됩니다.")
    cv2.waitKey(0)
    cv2.destroyAllWindows()