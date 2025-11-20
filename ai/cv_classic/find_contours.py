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

    # --- 5단계: 전처리 (적응형 임계값 사용!) ---
    # 경계 검출은 흑백(Grayscale) 이미지에서 더 잘 작동합니다.
    gray = cv2.cvtColor(image_warped, cv2.COLOR_BGR2GRAY)

    # '단순' 임계값이 아닌 '적응형' 임계값을 사용합니다.
    # 이것이 조명 변화를 이기는 핵심입니다.
    # cv2.ADAPTIVE_THRESH_GAUSSIAN_C: 주변 픽셀에 가중치를 주어 평균 계산 (더 똑똑함)
    # cv2.THRESH_BINARY_INV: 평균보다 '어두운' 픽셀(팔레트, 글자)을 흰색(255)으로
    # blockSize (15): 주변 몇 픽셀을 볼 것인가 (홀수, 튜닝 필요)
    # C (4): 계산된 평균에서 뺄 값 (튜닝 필요)
    thresh = cv2.adaptiveThreshold(gray, 255, 
                                    cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                    cv2.THRESH_BINARY_INV, 
                                    15, 4) 

    # (디버깅) 흑백으로 변환된 이미지를 확인
    # 창 이름이 바뀌었습니다.
    cv2.imshow("Threshold (Adaptive)", thresh)


    # --- 6단계: 경계 검출 (Contour Finding) ---
    # (이 아래 6, 7, 8단계 코드는 이전과 동일합니다. 수정할 필요 없습니다.)
    contours, hierarchy = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    # ... (이하 동일) ...


    # --- 6단계: 경계 검출 (Contour Finding) ---
    # 'thresh' 이미지에서 모든 외곽선(contours)을 찾습니다.
    # cv2.RETR_EXTERNAL: 가장 바깥쪽 외곽선만 찾습니다. (사각형 안의 사각형은 무시)
    # cv2.CHAIN_APPROX_SIMPLE: 외곽선의 꼭짓점만 저장해 메모리를 아낍니다.
    contours, hierarchy = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    print(f"총 {len(contours)}개의 물체(경계)를 찾았습니다.")

    # # --- 7단계: 찾은 경계 필터링 및 ROI 색상 추출 ---
    # image_debug = image_warped.copy() # 원본 컬러 이미지에 다시 그립니다.
    # all_palette_colors = [] # 검출된 (좌표, 색상) 정보를 저장할 리스트

    # for cnt in contours:
    #     # 7-1. 찾은 경계(cnt)의 사각형 바운더리(x,y,w,h)를 계산합니다.
    #     x, y, w, h = cv2.boundingRect(cnt)
        
    #     # 7-2. 필터링: (이전과 동일)
    #     # (튜닝된 is_box_shape 조건을 여기에 넣으세요)
    #     is_box_shape = (w > 20) and (h > 20) and (w < 50) and (h < 50) 
        
    #     if is_box_shape:
    #         # 7-3. (디버깅) 찾은 위치에 초록색 사각형 그리기
    #         cv2.rectangle(image_debug, (x, y), (x + w, y + h), (0, 255, 0), 2)

    #         # 7-4. ★★★ 핵심 ★★★
    #         # 흑백 이미지(thresh)에서 찾은 좌표(x,y,w,h)를 사용해서
    #         # '원본 컬러 이미지(image_warped)'에서 해당 영역을 잘라냅니다.
    #         color_roi_patch = image_warped[y:y+h, x:x+w]
            
    #         # 7-5. 잘라낸 컬러 영역의 '평균 색상'을 계산합니다.
    #         avg_color = cv2.mean(color_roi_patch) # (B, G, R, Alpha) 튜플 반환
            
    #         # 7-6. 결과 저장
    #         # (x좌표, y좌표, 평균 BGR값)을 리스트에 저장
    #         all_palette_colors.append( (x, y, avg_color[:3]) )


    # print(f"필터링 후, {len(all_palette_colors)}개의 유효한 ROI를 찾았습니다.")

    # # --- 8단계: 결과 정렬 및 출력 (새로 추가됨) ---

    # if all_palette_colors:
    #     # 찾은 팔레트들을 '정렬'합니다.
    #     # 1순위: y좌표 (윗줄, 아랫줄 구분)
    #     # 2순위: x좌표 (왼쪽->오른쪽 순서)
    #     all_palette_colors.sort(key=lambda p: (p[1], p[0])) # (y, x) 순으로 정렬

    #     print("\n--- 검출된 팔레트 색상 (BGR) ---")
    #     for (x, y, avg_bgr) in all_palette_colors:
    #         # 소수점은 버리고 정수로 출력
    #         print(f"좌표(y={y}, x={x}): B={avg_bgr[0]:.0f}, G={avg_bgr[1]:.0f}, R={avg_bgr[2]:.0f}")

    # else:
    #     print("유효한 ROI를 찾지 못했습니다. 7-2 필터링 값을 확인하세요.")

    # --- 7단계: 찾은 경계 필터링 및 ROI ★LAB★ 색상 추출 ---
    image_debug = image_warped.copy()
    all_palette_colors = [] # 검출된 (좌표, LAB값) 정보를 저장할 리스트

    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        is_box_shape = (w > 20) and (h > 20) and (w < 50) and (h < 50) 
        
        if is_box_shape:
            cv2.rectangle(image_debug, (x, y), (x + w, y + h), (0, 255, 0), 2)
            
            # 1. 원본 컬러에서 ROI 패치 추출
            color_roi_patch = image_warped[y:y+h, x:x+w]
            
            # 2. BGR 평균 색상 계산
            avg_bgr_color = cv2.mean(color_roi_patch)[:3]
            
            # 3. ★★★ BGR을 LAB로 변환 ★★★
            # cvtColor는 '이미지'를 입력받으므로, 1x1 픽셀 이미지로 만듭니다.
            # np.uint8 : 0~255 사이의 정수형 픽셀 값이라는 의미
            bgr_pixel_image = np.array([[avg_bgr_color]], dtype=np.uint8)
            
            # BGR 이미지를 LAB 이미지로 변환
            lab_pixel_image = cv2.cvtColor(bgr_pixel_image, cv2.COLOR_BGR2LAB)
            
            # 1x1 LAB 이미지에서 [L, a, b] 값 추출
            avg_lab_color = lab_pixel_image[0][0] # [L, a, b]
            
            # 4. 결과 저장 (LAB 값으로 저장)
            all_palette_colors.append( (x, y, avg_lab_color) )


    print(f"필터링 후, {len(all_palette_colors)}개의 유효한 ROI를 찾았습니다.")

    # --- 8단계: 결과 정렬 및 출력 (LAB 기준) ---

    if all_palette_colors:
        # (y, x) 순으로 정렬 (이전과 동일)
        all_palette_colors.sort(key=lambda p: (p[1], p[0])) 

        print("\n--- 검출된 팔레트 색상 (LAB) ---")
        for (x, y, avg_lab) in all_palette_colors:
            # L, a, b 값 출력
            print(f"좌표(y={y}, x={x}): L={avg_lab[0]}, a={avg_lab[1]}, b={avg_lab[2]}")

    else:
        print("유효한 ROI를 찾지 못했습니다. 7-2 필터링 값을 확인하세요.")



    # --- 9단계: 결과 보여주기 ---
    cv2.imshow("Warped Image with Auto-Detected ROIs", image_debug)

    print("\n터미널에 출력된 BGR 값들을 확인하세요.")
    cv2.waitKey(0)
    cv2.destroyAllWindows()