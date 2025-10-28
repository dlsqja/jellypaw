# 1. 필요한 라이브러리를 불러옵니다.
import cv2
import numpy as np

print("OpenCV, Numpy 임포트 성공!")

# 2. 분석할 이미지 파일의 이름을 지정합니다.
# (이 스크립트와 같은 폴더에 있다고 가정)
image_filename = "test_kit.png"

# 3. OpenCV를 사용해 이미지를 읽어옵니다.
# cv2.IMREAD_COLOR: 이미지를 컬러(BGR)로 불러옵니다.
image = cv2.imread(image_filename, cv2.IMREAD_COLOR)

# 4. 이미지가 제대로 불러와졌는지 확인 (필수!)
if image is None:
    print(f"'{image_filename}' 파일을 찾을 수 없거나, 이미지 파일이 아닙니다.")
    print("경로와 파일 이름을 다시 확인하세요.")
else:
    print(f"'{image_filename}' 파일 로드 성공!")
    print(f"이미지 크기 (세로, 가로, 채널): {image.shape}")

    # 5. 불러온 이미지를 "Test Image"라는 제목의 새 창에 띄웁니다.
    cv2.imshow("Test Image", image)

    print("이미지 창이 떴습니다. 아무 키나 누르면 창이 닫힙니다.")

    # 6. 사용자가 키보드를 누를 때까지 무한정 대기합니다. (0)
    # 이게 없으면 창이 1초만에 떴다가 사라집니다.
    cv2.waitKey(0)

    # 7. (키가 눌리면) 모든 OpenCV 창을 닫습니다.
    cv2.destroyAllWindows()