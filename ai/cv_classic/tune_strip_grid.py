# tune_strip_grid.py
import cv2
import numpy as np

# (Helper 함수는 그대로 둡니다)
def get_lab_color(image, x, y, w, h):
    pad_roi = image[y:y+h, x:x+w]
    if pad_roi.size == 0: return np.array([0, 0, 0])
    avg_bgr_color = cv2.mean(pad_roi)[:3]
    bgr_pixel_image = np.array([[avg_bgr_color]], dtype=np.uint8)
    lab_pixel_image = cv2.cvtColor(bgr_pixel_image, cv2.COLOR_BGR2LAB)
    return lab_pixel_image[0][0]

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
    height = int(width * aspect_ratio) 
    
    print(f"표준화 이미지 크기: w={width}, h={height}")

    pts_dst = np.array([[0, 0], [width - 1, 0], [width - 1, height - 1], [0, height - 1]], dtype=np.float32)
    matrix = cv2.getPerspectiveTransform(pts_src_chart, pts_dst)
    image_warped = cv2.warpPerspective(image, matrix, (width, height))
    
    # --- [5, 6단계] '소변 스틱' (Fixed Grid) ---
    PAD_COUNT = 10
    
    # (h=205 기준 예시값: 이 값들을 1씩 바꿔가며 튜닝하세요!)
    STRIP_PAD_Y = 82      # 스틱의 'Y 시작점' (예: 80, 81, 82...)
    STRIP_PAD_H = 32      # 패드의 '세로 높이' (예: 30, 31, 32...)
    STRIP_PAD_START_X = 45  # '첫 패드'의 'X 시작점'
    STRIP_PAD_WIDTH = 30  # 패드의 '가로 너비'
    STRIP_PAD_GAP = 52    # '다음 패드'까지의 'X 간격'
    
    # --- (여기까지만 튜닝하세요) ---
    
    image_debug = image_warped.copy()
    strip_pad_labs = [] 

    print("\n--- [6단계] 소변 스틱 LAB (Fixed Grid) ---")
    
    for i in range(PAD_COUNT):
        current_x = STRIP_PAD_START_X + (i * STRIP_PAD_GAP)
        
        lab_val = get_lab_color(image_warped, current_x, STRIP_PAD_Y, STRIP_PAD_WIDTH, STRIP_PAD_H)
        strip_pad_labs.append( (current_x, lab_val) )
        
        cv2.rectangle(image_debug, 
                      (current_x, STRIP_PAD_Y), 
                      (current_x + STRIP_PAD_WIDTH, STRIP_PAD_Y + STRIP_PAD_H), 
                      (0, 0, 255), 2) # 빨간색
                      
        print(f"  패드 #{i+1} (x={current_x}): L={lab_val[0]}, a={lab_val[1]}, b={lab_val[2]}")

    # (결과 보여주기)
    cv2.imshow("Strip Grid TUNING (Red Boxes)", image_debug)
    cv2.waitKey(0)
    cv2.destroyAllWindows()