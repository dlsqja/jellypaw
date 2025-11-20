import cv2

# 마우스 클릭 이벤트를 처리할 콜백 함수
def mouse_click_handler(event, x, y, flags, param):
    # 왼쪽 마우스 버튼을 '눌렀을 때'
    if event == cv2.EVENT_LBUTTONDOWN:
        print(f"클릭한 좌표: (x={x}, y={y})")
        
        # 좌표를 이미지 위에 빨간 점으로 표시
        cv2.circle(param['image'], (x, y), 5, (0, 0, 255), -1)
        cv2.imshow(param['title'], param['image'])

# --- 메인 코드 ---
image_filename = "test_strip.jpg"
image = cv2.imread(image_filename)

if image is None: 
    print("이미지를 찾을 수 없습니다.")
else:
    # 원본 이미지를 복제 (좌표를 표시하기 위함)
    image_to_show = image.copy()
    window_title = "Click Four Corners"

    # 'param' 딕셔너리를 통해 콜백 함수에 데이터를 전달
    callback_param = {'image': image_to_show, 'title': window_title}

    cv2.imshow(window_title, image_to_show)
    
    # 'mouse_click_handler' 함수를 마우스 이벤트와 연결
    cv2.setMouseCallback(window_title, mouse_click_handler, callback_param)
    
    print("이미지 위에서 키트의 네 모서리를 차례대로 클릭하세요.")
    print("(왼쪽-위 -> 오른쪽-위 -> 오른쪽-아래 -> 왼쪽-아래 순서)")
    print("좌표를 다 적었으면 'q' 키를 눌러 종료하세요.")
    
    # 'q' 키를 누를 때까지 대기
    while True:
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
            
    cv2.destroyAllWindows()