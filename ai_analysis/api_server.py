# api_server.py

import os
import sys
import json
import subprocess
from fastapi import FastAPI, UploadFile, File, HTTPException
from starlette.responses import JSONResponse
import uuid
import shutil

# 1. FastAPI 애플리케이션 초기화
app = FastAPI(title="AI Analysis Service", version="1.0")

# 2. 설정 변수
# Dockerfile의 WORKDIR /app과 일치해야 함.
BASE_DIR = "/app" 
# 임시 이미지 파일을 저장할 디렉토리 (컨테이너 내부)
TEMP_UPLOAD_DIR = os.path.join(BASE_DIR, "temp_images") 
# AI 스크립트의 경로 (Dockerfile의 COPY 경로와 일치해야 함)
AI_SCRIPT_PATH = os.path.join(BASE_DIR, "analyze_corrected.py")
# Python 인터프리터 경로 (컨테이너 내부에 설치된 Python)
PYTHON_EXECUTABLE = shutil.which("python")

# 디렉토리 생성 (컨테이너 시작 시 실행되도록 보장)
os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)


# 3. 헬스 체크 엔드포인트 (컨테이너 생존 확인용)
@app.get("/health")
def health_check():
    """컨테이너 상태 및 기본 환경 정보를 반환합니다."""
    return {
        "status": "UP",
        "service": "AI Analysis",
        "python_path": PYTHON_EXECUTABLE,
        "ai_script": AI_SCRIPT_PATH
    }


# 4. 핵심 분석 엔드포인트 (Spring이 호출할 REST API)
@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    
    # 4-1. 파일 저장 경로 및 이름 설정
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    temp_file_path = os.path.join(TEMP_UPLOAD_DIR, unique_filename)

    # 4-2. 이미지 파일을 임시로 저장
    try:
        with open(temp_file_path, "wb") as buffer:
            # UploadFile의 content를 디스크에 저장
            content = await file.read()
            buffer.write(content)
        
        print(f"--- [INFO] Image saved to: {temp_file_path} ---", file=sys.stderr)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File saving failed: {e}")

    # 4-3. Python 스크립트 (analyze_corrected.py) 실행
    process = None
    try:
        # Spring의 ProcessBuilder 역할: Python 스크립트를 자식 프로세스로 실행
        command = [PYTHON_EXECUTABLE, AI_SCRIPT_PATH, temp_file_path]
        
        # subprocess.run을 사용하여 외부 프로세스를 실행하고 결과를 캡처
        process = subprocess.run(
            command,
            capture_output=True, # stdout과 stderr을 캡처
            text=True,           # 출력을 문자열로 처리
            check=False,          # 오류 발생 시에도 예외를 즉시 발생시키지 않음
            cwd=BASE_DIR           # 기본 작업 디렉토리(/app) 명시
        )

        # 4-4. 오류 확인 및 처리
        if process.returncode != 0:
            # analyze_corrected.py의 에러 메시지는 stderr에 출력됨
            print(f"--- [ERROR] Script Stderr: \n{process.stderr} ---", file=sys.stderr)
            
            # Python 스크립트가 반환한 JSON 에러 메시지가 있다면 사용
            try:
                error_details = json.loads(process.stderr.split('\n')[-2])
            except:
                error_details = {"status": "PYTHON_ERROR", "message": "AI script failed to execute."}

            raise HTTPException(status_code=500, detail=error_details)

        # 4-5. 성공: 표준 출력(Stdout)에서 JSON 결과 파싱
        try:
            # analyze_corrected.py는 최종 JSON만 stdout에 출력해야 함.
            result_json = json.loads(process.stdout)
            print(f"--- [INFO] Analysis success. Detections: {result_json.get('analysis_count')} ---", file=sys.stderr)
            return JSONResponse(content=result_json, status_code=200)

        except json.JSONDecodeError:
            print(f"--- [ERROR] JSON Decode Failed: Stdout was: \n{process.stdout} ---", file=sys.stderr)
            print(f"--- [ERROR] Script Stderr: \n{process.stderr} ---", file=sys.stderr)
            raise HTTPException(status_code=500, detail={"status": "PARSING_ERROR", "message": "AI script returned invalid JSON."})

    finally:
        # 4-6. 임시 파일 정리 (필수!)
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            print(f"--- [INFO] Cleaned up file: {temp_file_path} ---", file=sys.stderr)


# 5. 실행 함수 (CMD에 의해 호출됨)
if __name__ == "__main__":
    # 이 부분은 Docker CMD에 의해 Uvicorn이 실행하므로, 실제로는 실행되지 X
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)