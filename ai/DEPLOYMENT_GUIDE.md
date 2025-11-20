# EC2 배포 및 백엔드/프론트 연결 가이드

## 1. EC2 보안 그룹 설정

EC2 인스턴스의 보안 그룹에서 **포트 8000**을 열어야 합니다.

### AWS 콘솔에서 설정:
1. EC2 → 인스턴스 선택 → 보안 그룹
2. 인바운드 규칙 편집
3. 규칙 추가:
   - **유형**: 사용자 지정 TCP
   - **포트**: 8000
   - **소스**: 
     - 백엔드 서버 IP만 허용하려면: 백엔드 서버의 IP/32
     - 모든 곳에서 허용하려면: 0.0.0.0/0 (개발용, 프로덕션에서는 제한 권장)

## 2. Docker 컨테이너 실행

EC2에서 Docker 컨테이너를 실행합니다:

```bash
# Docker 이미지 빌드
docker build -t urine-analysis:latest .

# 컨테이너 실행 (포트 8000 매핑)
docker run -d \
  --name urine-analysis \
  -p 8000:8000 \
  --gpus all \
  urine-analysis:latest
```

## 3. 서비스 확인

### 헬스 체크:
```bash
curl http://EC2_IP:8000/health
```

응답 예시:
```json
{
  "status": "UP",
  "service": "AI Analysis",
  "python_path": "/usr/bin/python",
  "ai_script": "/app/analyze_corrected_improved.py"
}
```

## 4. 백엔드에서 호출하는 방법

### Spring Boot 예시:

```java
@Service
public class UrineAnalysisService {
    
    @Value("${ai.service.url}")
    private String aiServiceUrl; // 예: http://EC2_IP:8000
    
    public UrineAnalysisResponse analyzeUrineTest(MultipartFile imageFile) {
        RestTemplate restTemplate = new RestTemplate();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", imageFile.getResource());
        
        HttpEntity<MultiValueMap<String, Object>> requestEntity = 
            new HttpEntity<>(body, headers);
        
        try {
            ResponseEntity<UrineAnalysisResponse> response = restTemplate.exchange(
                aiServiceUrl + "/analyze",
                HttpMethod.POST,
                requestEntity,
                UrineAnalysisResponse.class
            );
            
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("AI 분석 서비스 호출 실패", e);
        }
    }
}
```

### 응답 DTO 예시:

```java
public class UrineAnalysisResponse {
    private String status;
    private Integer analysisCount;
    private List<TestResult> summary;
    private String detailSavedPath;
    
    // getters, setters
}

public class TestResult {
    private String testCode;
    private String testNameKo;
    private String testNameEn;
    private String unit;
    private String matchedValue;
    private String result; // "negative", "positive", "trace" 등
    private Boolean isNormal;
    private String severity; // "mild", "moderate", "severe" 등
    private Double deltaE;
    private Boolean isApproximate;
    private String confidence; // "high", "medium", "low"
    private List<String> suspectedConditions;
    
    // getters, setters
}
```

### application.yml 설정:

```yaml
ai:
  service:
    url: http://EC2_IP:8000  # EC2 인스턴스의 공개 IP 또는 도메인
```

## 5. 프론트엔드에서 호출하는 방법

프론트엔드는 **백엔드를 통해** 호출해야 합니다 (직접 EC2 호출 X).

### React 예시:

```typescript
// API 호출 함수
const analyzeUrineTest = async (imageFile: File) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const response = await fetch('http://백엔드서버/api/urine-test/analyze', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('분석 실패');
  }
  
  return await response.json();
};

// 사용 예시
const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  try {
    const result = await analyzeUrineTest(file);
    console.log('분석 결과:', result);
    
    // result.summary 배열을 사용하여 UI에 표시
    result.summary.forEach((test: TestResult) => {
      console.log(`${test.testNameKo}: ${test.result}`);
      if (test.suspectedConditions.length > 0) {
        console.log('의심 질환:', test.suspectedConditions);
      }
    });
  } catch (error) {
    console.error('분석 오류:', error);
  }
};
```

### TypeScript 타입 정의:

```typescript
interface UrineAnalysisResponse {
  status: string;
  analysisCount: number;
  summary: TestResult[];
  detailSavedPath?: string;
}

interface TestResult {
  testCode: string;
  testNameKo: string;
  testNameEn: string;
  unit: string;
  matchedValue: string;
  result: 'negative' | 'positive' | 'trace' | 'normal' | 'abnormal' | 'acidic' | 'alkaline';
  isNormal: boolean;
  severity: string;
  deltaE: number;
  isApproximate: boolean;
  confidence: 'high' | 'medium' | 'low';
  suspectedConditions: string[];
}
```

## 6. API 응답 예시

### 성공 응답:

```json
{
  "status": "SUCCESS",
  "analysisCount": 10,
  "summary": [
    {
      "testCode": "Urobilinogen",
      "testNameKo": "유로빌리노겐",
      "testNameEn": "Urobilinogen",
      "unit": "mg/dL (μmol/L)",
      "matchedValue": "2",
      "result": "negative",
      "isNormal": true,
      "severity": "N/A",
      "deltaE": 15.31,
      "isApproximate": true,
      "confidence": "high",
      "suspectedConditions": []
    },
    {
      "testCode": "Glucose",
      "testNameKo": "포도당",
      "testNameEn": "Glucose",
      "unit": "mg/dL (mmol/L)",
      "matchedValue": "100",
      "result": "trace",
      "isNormal": false,
      "severity": "trace",
      "deltaE": 28.37,
      "isApproximate": true,
      "confidence": "medium",
      "suspectedConditions": []
    },
    {
      "testCode": "Bilirubin",
      "testNameKo": "빌리루빈",
      "testNameEn": "Bilirubin",
      "unit": "mg/dL",
      "matchedValue": "+",
      "result": "positive",
      "isNormal": false,
      "severity": "mild",
      "deltaE": 8.0,
      "isApproximate": true,
      "confidence": "high",
      "suspectedConditions": [
        "간 질환 (간세포 장애, 담도 폐색)",
        "황달"
      ]
    }
    // ... 나머지 7개 항목
  ],
  "detailSavedPath": "results/analysis_detail_20241201_143022.json"
}
```

### 오류 응답:

```json
{
  "status": "ERROR",
  "message": "이미지 파일을 로드할 수 없습니다: /app/temp_images/xxx.jpg",
  "path": "/app/temp_images/xxx.jpg"
}
```

## 7. 트러블슈팅

### 문제: 연결이 안 됨
- EC2 보안 그룹에서 포트 8000이 열려있는지 확인
- Docker 컨테이너가 실행 중인지 확인: `docker ps`
- 컨테이너 로그 확인: `docker logs urine-analysis`

### 문제: CORS 오류
FastAPI에 CORS 미들웨어 추가 필요:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인만 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 문제: 타임아웃
- 이미지 분석에 시간이 걸릴 수 있으므로 백엔드/프론트에서 타임아웃 설정 증가
- Spring: `RestTemplate`의 `ReadTimeout` 증가
- 프론트: `fetch`의 `timeout` 옵션 설정

## 8. 프로덕션 권장 사항

1. **HTTPS 사용**: Nginx 리버스 프록시 설정
2. **인증 추가**: API 키 또는 JWT 토큰 인증
3. **로드 밸런싱**: 여러 인스턴스 사용 시
4. **모니터링**: CloudWatch 또는 Prometheus 연동
5. **로그 관리**: ELK 스택 또는 CloudWatch Logs

