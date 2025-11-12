# Dockerfile

# 1. 베이스 이미지 설정 (CUDA 12.1 런타임 사용)
# 이는 PyTorch 2.5.1+cu121과 정확히 일치하는 CUDA 버전
FROM nvidia/cuda:12.1.1-runtime-ubuntu22.04

# 2. Python 설치 및 환경 설정 (CUDA 이미지에는 Python이 없을 수 있음)
RUN apt-get update

RUN apt-get install -y \
    python3.10 \
    python3-pip \
    build-essential \
    libgl1-mesa-glx \
    libgomp1 \
    libglib2.0-0 

RUN rm -rf /var/lib/apt/lists/*

# 3. Python 3.12를 기본 python으로 설정
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.10 1

# 4. 작업 디렉토리 설정
WORKDIR /app

# 5. 필요한 Python 라이브러리 목록 복사
COPY requirements.txt .

# 6. 요구사항 파일의 패키지 설치
# requirements.txt에 torch==2.5.1+cu121이 포함
RUN pip install --no-cache-dir -r requirements.txt

# 7. AI 스크립트, 모델 및 기타 파일 복사
COPY yolo_model/analyze_corrected.py /app/ 
COPY yolo_model/weights /app/weights/ 
COPY yolo_model/digital_reference_colors_hex.json /app/
COPY api_server.py /app/

# 8. 포트 노출
EXPOSE 8000

# 9. 컨테이너 시작 시 실행될 명령어
CMD ["uvicorn", "api_server:app", "--host", "0.0.0.0", "--port", "8000"]