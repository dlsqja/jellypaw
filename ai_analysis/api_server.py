# api_server.py

import os
import sys
import json
import subprocess
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from starlette.responses import JSONResponse
from starlette import status
import uuid
import shutil
import redis
import asyncio
import threading
from concurrent.futures import ThreadPoolExecutor
from kafka import KafkaProducer, KafkaAdminClient
from kafka.admin import NewTopic
from kafka.errors import KafkaError, TopicAlreadyExistsError

# 1. FastAPI 애플리케이션 초기화
app = FastAPI(title="AI Analysis Service", version="1.0")

# CORS 미들웨어 추가 (프론트엔드에서 직접 호출 시 필요)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인만 허용 (예: ["https://yourdomain.com"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. 설정 변수
# Dockerfile의 WORKDIR /app과 일치해야 함.
BASE_DIR = "/app" 
# 임시 이미지 파일을 저장할 디렉토리 (컨테이너 내부)
TEMP_UPLOAD_DIR = os.path.join(BASE_DIR, "temp_images") 
# AI 스크립트의 경로 (Dockerfile의 COPY 경로와 일치해야 함)
AI_SCRIPT_PATH = os.path.join(BASE_DIR, "analyze_corrected_improved.py")
# Python 인터프리터 경로 (컨테이너 내부에 설치된 Python)
PYTHON_EXECUTABLE = shutil.which("python")

# Redis 설정 (환경변수로 설정 가능, 기본값: localhost:6379)
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB = int(os.getenv("REDIS_DB", "0"))
REDIS_QUEUE_NAME = os.getenv("REDIS_QUEUE_NAME", "analysis_queue")

# Worker 설정
MAX_CONCURRENT_WORKERS = int(os.getenv("MAX_CONCURRENT_WORKERS", "5"))

# Kafka 설정 (환경변수로 설정 가능, 기본값: localhost:9092)
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "analysis-results-topic")

# Redis 클라이언트 초기화
try:
    redis_client = redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        db=REDIS_DB,
        decode_responses=True,  # 문자열로 자동 디코딩
        socket_connect_timeout=5,  # 연결 타임아웃 5초
        socket_timeout=5  # 소켓 타임아웃 5초
    )
    # 연결 테스트
    redis_client.ping()
    print(f"--- [INFO] Redis 연결 성공: {REDIS_HOST}:{REDIS_PORT} ---", file=sys.stderr)
except redis.ConnectionError as e:
    print(f"--- [WARNING] Redis 연결 실패: {e} ---", file=sys.stderr)
    print(f"--- [WARNING] Redis 없이도 동작하지만 큐잉 기능은 사용할 수 없습니다. ---", file=sys.stderr)
    redis_client = None

# Kafka AdminClient 및 Producer 초기화
kafka_producer = None
try:
    bootstrap_servers_list = KAFKA_BOOTSTRAP_SERVERS.split(',')
    
    # 1. AdminClient로 topic 생성 시도
    try:
        admin_client = KafkaAdminClient(
            bootstrap_servers=bootstrap_servers_list,
            client_id='ai-analysis-admin',
            request_timeout_ms=10000,  # 10초 타임아웃
        )
        
        # Topic이 없으면 생성
        topic_list = [NewTopic(
            name=KAFKA_TOPIC,
            num_partitions=1,  # 단일 브로커이므로 1개 파티션
            replication_factor=1  # 단일 브로커이므로 복제 팩터 1
        )]
        
        try:
            admin_client.create_topics(new_topics=topic_list, validate_only=False)
            print(f"--- [INFO] Kafka Topic 생성 완료: {KAFKA_TOPIC} ---", file=sys.stderr)
        except TopicAlreadyExistsError:
            print(f"--- [INFO] Kafka Topic 이미 존재: {KAFKA_TOPIC} ---", file=sys.stderr)
        except Exception as e:
            print(f"--- [WARNING] Kafka Topic 생성 실패 (자동 생성될 수 있음): {e} ---", file=sys.stderr)
        finally:
            admin_client.close()
    except Exception as e:
        print(f"--- [WARNING] Kafka AdminClient 연결 실패 (topic 자동 생성에 의존): {e} ---", file=sys.stderr)
    
    # 2. Producer 초기화
    kafka_producer = KafkaProducer(
        bootstrap_servers=bootstrap_servers_list,
        value_serializer=lambda v: json.dumps(v).encode('utf-8'),  # JSON 문자열로 직렬화
        key_serializer=lambda k: k.encode('utf-8') if k else None,  # 키는 request_id 사용
        acks=1,  # 리더 브로커로부터 확인 받음 (단일 브로커 환경에 적합)
        retries=3,  # 재시도 3회
        max_in_flight_requests_per_connection=1,  # 순서 보장
        request_timeout_ms=30000,  # 요청 타임아웃 30초
        metadata_max_age_ms=300000,  # 메타데이터 캐시 유지 시간 5분
        max_block_ms=60000,  # 블로킹 최대 시간 60초
        max_request_size=10485760,  # 최대 요청 크기 10MB (기본값 1MB에서 증가)
        compression_type='gzip',  # 메시지 압축 (크기 감소)
    )
    
    # 3. Topic 메타데이터 미리 가져오기 (연결 테스트)
    try:
        # 첫 번째 메시지 전송 전에 메타데이터를 가져오기 위해 dummy send 시도
        # 하지만 실제로는 metadata() 메서드를 사용하는 것이 더 좋음
        partitions = kafka_producer.partitions_for(KAFKA_TOPIC)
        if partitions:
            print(f"--- [INFO] Kafka Producer 연결 성공: {KAFKA_BOOTSTRAP_SERVERS}, topic={KAFKA_TOPIC}, partitions={partitions} ---", file=sys.stderr)
        else:
            print(f"--- [WARNING] Kafka Topic 메타데이터를 가져올 수 없음: {KAFKA_TOPIC} ---", file=sys.stderr)
    except Exception as e:
        print(f"--- [WARNING] Kafka Topic 메타데이터 확인 실패 (첫 메시지 전송 시 자동 생성될 수 있음): {e} ---", file=sys.stderr)
        print(f"--- [INFO] Kafka Producer는 초기화되었지만 topic 확인은 실패했습니다. ---", file=sys.stderr)
    
except Exception as e:
    print(f"--- [WARNING] Kafka Producer 연결 실패: {e} ---", file=sys.stderr)
    print(f"--- [WARNING] Kafka 없이도 동작하지만 이벤트 발행 기능은 사용할 수 없습니다. ---", file=sys.stderr)
    kafka_producer = None

# 디렉토리 생성 (컨테이너 시작 시 실행되도록 보장)
os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)

# Worker 풀 설정 (최대 동시 실행 개수 제한)
worker_semaphore = threading.Semaphore(MAX_CONCURRENT_WORKERS)
worker_executor = ThreadPoolExecutor(max_workers=MAX_CONCURRENT_WORKERS)


# 3. 헬스 체크 엔드포인트 (컨테이너 생존 확인용)
@app.get("/health")
def health_check():
    """컨테이너 상태 및 기본 환경 정보를 반환합니다."""
    redis_status = "DOWN"
    if redis_client:
        try:
            redis_client.ping()
            redis_status = "UP"
        except:
            redis_status = "DOWN"
    
    return {
        "status": "UP",
        "service": "AI Analysis",
        "python_path": PYTHON_EXECUTABLE,
        "ai_script": AI_SCRIPT_PATH,
        "redis": {
            "status": redis_status,
            "host": REDIS_HOST,
            "port": REDIS_PORT,
            "queue": REDIS_QUEUE_NAME
        },
        "kafka": {
            "status": "UP" if kafka_producer else "DOWN",
            "bootstrap_servers": KAFKA_BOOTSTRAP_SERVERS,
            "topic": KAFKA_TOPIC
        }
    }


# 4. 분석 작업 실행 함수 (Worker에서 호출)
def execute_analysis(job_data: dict):
    """실제 AI 분석을 수행하는 함수"""
    request_id = job_data.get("request_id")
    userId = job_data.get("userId")
    petId = job_data.get("petId")
    temp_file_path = job_data.get("file_path")
    
    print(f"--- [INFO] Worker 시작: request_id={request_id}, userId={userId}, petId={petId}, file={temp_file_path} ---", file=sys.stderr)
    
    try:
        # Python 스크립트 실행
        command = [PYTHON_EXECUTABLE, AI_SCRIPT_PATH, temp_file_path]
        
        process = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=False,
            cwd=BASE_DIR
        )

        # 오류 확인
        if process.returncode != 0:
            print(f"--- [ERROR] Analysis failed: request_id={request_id} ---", file=sys.stderr)
            print(f"--- [ERROR] Stderr: \n{process.stderr} ---", file=sys.stderr)
            return {
                "request_id": request_id,
                "status": "ERROR",
                "error": process.stderr
            }

        # 결과 파싱
        try:
            result_json = json.loads(process.stdout)
            print(f"--- [INFO] Analysis 완료: request_id={request_id}, userId={userId}, petId={petId}, detections={result_json.get('analysis_count')} ---", file=sys.stderr)
            
            # Kafka에 분석 완료 이벤트 발행
            if kafka_producer:
                try:
                    event_data = {
                        "request_id": request_id,
                        "userId": userId,
                        "petId": petId,
                        "status": "SUCCESS",
                        "result": result_json
                    }
                    
                    # 메시지 크기 확인 (디버깅용)
                    message_size = len(json.dumps(event_data).encode('utf-8'))
                    if message_size > 1024 * 1024:  # 1MB 이상이면 경고
                        print(f"--- [WARNING] Kafka 메시지 크기가 큼: {message_size / 1024 / 1024:.2f}MB, request_id={request_id} ---", file=sys.stderr)
                    else:
                        print(f"--- [INFO] Kafka 메시지 크기: {message_size / 1024:.2f}KB, request_id={request_id} ---", file=sys.stderr)
                    
                    # Kafka에 발행 (key는 request_id 사용)
                    future = kafka_producer.send(
                        KAFKA_TOPIC,
                        key=request_id,
                        value=event_data
                    )
                    
                    # Future 결과 확인 (선택적)
                    try:
                        record_metadata = future.get(timeout=10)  # 10초 내에 발행 완료 확인
                        print(f"--- [INFO] Kafka 이벤트 발행 완료: request_id={request_id}, topic={KAFKA_TOPIC}, partition={record_metadata.partition}, offset={record_metadata.offset} ---", file=sys.stderr)
                    except Exception as e:
                        print(f"--- [WARNING] Kafka 이벤트 발행 확인 실패 (발행은 시도됨): request_id={request_id}, error={e} ---", file=sys.stderr)
                except KafkaError as e:
                    print(f"--- [ERROR] Kafka 발행 실패: request_id={request_id}, error={e} ---", file=sys.stderr)
                except Exception as e:
                    print(f"--- [ERROR] Kafka 발행 중 예외 발생: request_id={request_id}, error={e} ---", file=sys.stderr)
            else:
                print(f"--- [WARNING] Kafka Producer가 없어 이벤트를 발행할 수 없습니다: request_id={request_id} ---", file=sys.stderr)
            
            return {
                "request_id": request_id,
                "userId": userId,
                "petId": petId,
                "status": "SUCCESS",
                "result": result_json
            }
        except json.JSONDecodeError:
            print(f"--- [ERROR] JSON 파싱 실패: request_id={request_id} ---", file=sys.stderr)
            
            # 에러 이벤트도 Kafka에 발행
            if kafka_producer:
                try:
                    error_event = {
                        "request_id": request_id,
                        "userId": userId,
                        "petId": petId,
                        "status": "ERROR",
                        "error": "Invalid JSON response"
                    }
                    future = kafka_producer.send(KAFKA_TOPIC, key=request_id, value=error_event)
                    try:
                        record_metadata = future.get(timeout=10)
                        print(f"--- [INFO] Kafka 에러 이벤트 발행 완료: request_id={request_id}, topic={KAFKA_TOPIC} ---", file=sys.stderr)
                    except Exception as e:
                        print(f"--- [WARNING] Kafka 에러 이벤트 발행 확인 실패 (발행은 시도됨): request_id={request_id}, error={e} ---", file=sys.stderr)
                except Exception as e:
                    print(f"--- [ERROR] Kafka 에러 이벤트 발행 실패: {e} ---", file=sys.stderr)
            
            return {
                "request_id": request_id,
                "status": "ERROR",
                "error": "Invalid JSON response"
            }
    except Exception as e:
        print(f"--- [ERROR] 예외 발생: request_id={request_id}, error={e} ---", file=sys.stderr)
        
        # 에러 이벤트도 Kafka에 발행
        if kafka_producer:
            try:
                error_event = {
                    "request_id": request_id,
                    "userId": userId,
                    "petId": petId,
                    "status": "ERROR",
                    "error": str(e)
                }
                future = kafka_producer.send(KAFKA_TOPIC, key=request_id, value=error_event)
                try:
                    record_metadata = future.get(timeout=10)
                    print(f"--- [INFO] Kafka 에러 이벤트 발행 완료: request_id={request_id}, topic={KAFKA_TOPIC} ---", file=sys.stderr)
                except Exception as e:
                    print(f"--- [WARNING] Kafka 에러 이벤트 발행 확인 실패 (발행은 시도됨): request_id={request_id}, error={e} ---", file=sys.stderr)
            except Exception as kafka_error:
                print(f"--- [ERROR] Kafka 에러 이벤트 발행 실패: {kafka_error} ---", file=sys.stderr)
        
        return {
            "request_id": request_id,
            "status": "ERROR",
            "error": str(e)
        }
    finally:
        # 임시 파일 정리
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            print(f"--- [INFO] 파일 정리 완료: {temp_file_path} ---", file=sys.stderr)


# 5. Worker 함수 (Redis 큐에서 작업을 가져와서 처리)
def worker_loop():
    """Redis 큐를 모니터링하고 작업을 처리하는 Worker 루프"""
    if not redis_client:
        print("--- [WARNING] Redis가 연결되지 않아 Worker를 시작할 수 없습니다. ---", file=sys.stderr)
        return
    
    print(f"--- [INFO] Worker 시작: 최대 동시 실행={MAX_CONCURRENT_WORKERS} ---", file=sys.stderr)
    
    while True:
        try:
            # Redis에서 작업 가져오기 (블로킹, 최대 1초 대기)
            result = redis_client.brpop(REDIS_QUEUE_NAME, timeout=1)
            
            if result:
                # result는 (queue_name, job_json_string) 튜플
                _, job_json = result
                job_data = json.loads(job_json)
                
                # Semaphore로 동시 실행 개수 제한
                worker_executor.submit(process_job_with_semaphore, job_data)
                
        except redis.ConnectionError:
            print("--- [ERROR] Redis 연결 오류, 5초 후 재시도... ---", file=sys.stderr)
            import time
            time.sleep(5)
        except Exception as e:
            print(f"--- [ERROR] Worker 오류: {e} ---", file=sys.stderr)
            import time
            time.sleep(1)


def process_job_with_semaphore(job_data: dict):
    """Semaphore를 사용하여 동시 실행 개수를 제한하는 래퍼 함수"""
    # Semaphore 획득 (최대 개수에 도달하면 대기)
    worker_semaphore.acquire()
    try:
        execute_analysis(job_data)
    finally:
        # Semaphore 해제 (다른 작업이 실행될 수 있도록)
        worker_semaphore.release()


# 6. Worker 스레드 시작 (서버 시작 시 자동 실행)
worker_thread = None

@app.on_event("startup")
async def startup_event():
    """서버 시작 시 Worker 스레드 시작"""
    global worker_thread
    if redis_client:
        worker_thread = threading.Thread(target=worker_loop, daemon=True)
        worker_thread.start()
        print("--- [INFO] Worker 스레드 시작됨 ---", file=sys.stderr)


# 7. 핵심 분석 엔드포인트 (비동기 처리)
@app.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    userId: str = Form(...),
    petId: str = Form(...)
):
    """이미지 분석 요청을 받아서 Redis 큐에 추가하고 즉시 응답"""
    
    if not redis_client:
        raise HTTPException(
            status_code=503, 
            detail="Redis가 연결되지 않아 큐잉 기능을 사용할 수 없습니다."
        )
    
    # 요청 ID 생성
    request_id = str(uuid.uuid4())
    
    # 파일 저장 경로 설정
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{request_id}{file_extension}"
    temp_file_path = os.path.join(TEMP_UPLOAD_DIR, unique_filename)

    # 이미지 파일 저장
    try:
        with open(temp_file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        print(f"--- [INFO] 파일 저장 완료: request_id={request_id}, userId={userId}, petId={petId}, path={temp_file_path} ---", file=sys.stderr)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File saving failed: {e}")

    # Redis 큐에 작업 추가
    try:
        job_data = {
            "request_id": request_id,
            "userId": userId,
            "petId": petId,
            "file_path": temp_file_path,
            "filename": file.filename
        }
        
        redis_client.lpush(REDIS_QUEUE_NAME, json.dumps(job_data))
        queue_length = redis_client.llen(REDIS_QUEUE_NAME)
        
        print(f"--- [INFO] 큐에 작업 추가: request_id={request_id}, userId={userId}, petId={petId}, 큐 길이={queue_length} ---", file=sys.stderr)
        
        # 즉시 202 Accepted 응답
        return JSONResponse(
            content={
                "status": "accepted",
                "request_id": request_id,
                "message": "분석 요청이 큐에 추가되었습니다.",
                "queue_length": queue_length
            },
            status_code=status.HTTP_202_ACCEPTED
        )
        
    except Exception as e:
        # 큐 추가 실패 시 파일 정리
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Queue error: {e}")


# 8. 큐 상태 확인 엔드포인트
@app.get("/queue/status")
def get_queue_status():
    """현재 큐 상태 확인"""
    if not redis_client:
        return {"error": "Redis not connected"}
    
    queue_length = redis_client.llen(REDIS_QUEUE_NAME)
    available_workers = worker_semaphore._value
    
    return {
        "queue_length": queue_length,
        "max_concurrent_workers": MAX_CONCURRENT_WORKERS,
        "available_workers": available_workers,
        "active_workers": MAX_CONCURRENT_WORKERS - available_workers
    }


# 5. 실행 함수 (CMD에 의해 호출됨)
if __name__ == "__main__":
    # 이 부분은 Docker CMD에 의해 Uvicorn이 실행하므로, 실제로는 실행되지 X
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9999)