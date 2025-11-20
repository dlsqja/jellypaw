# JSON 응답 필드 설명서

## 프론트엔드 응답 JSON 구조

```json
{
  "status": "SUCCESS",
  "analysis_count": 10,
  "summary": [
    {
      "test_code": "Urobilinogen",
      "test_name_ko": "유로빌리노겐",
      "test_name_en": "Urobilinogen",
      "unit": "mg/dL (μmol/L)",
      "matched_value": "2",
      "result": "negative",
      "is_normal": true,
      "severity": "N/A",
      "delta_e": 15.31,
      "is_approximate": true,
      "confidence": "high",
      "suspected_conditions": []
    }
  ],
  "detail_saved_path": "results/analysis_detail_20241112_182738.json"
}
```

## 최상위 필드

### `status`

- **의미**: 분석 요청 처리 상태
- **타입**: `string`
- **가능한 값**:
  - `"SUCCESS"`: 분석 성공
  - `"ERROR"`: 분석 실패

### `analysis_count`

- **의미**: 분석된 검사 항목 개수
- **타입**: `number` (integer)
- **예시**: `10` (소변검사 스틱의 10개 패드)

### `summary`

- **의미**: 각 검사 항목별 분석 결과 배열
- **타입**: `array` of objects
- **길이**: 항상 10개 (10개 검사 항목)

### `detail_saved_path` (선택적)

- **의미**: 상세 분석 결과가 저장된 파일 경로
- **타입**: `string`
- **용도**: 디버깅 또는 상세 분석 결과 확인용

---

## `summary` 배열 내 각 항목의 필드

### `test_code`

- **의미**: 검사 항목의 코드명 (영문)
- **타입**: `string`
- **가능한 값**:
  - `"Urobilinogen"`: 유로빌리노겐
  - `"Glucose"`: 포도당
  - `"Bilirubin"`: 빌리루빈
  - `"Ketones"`: 케톤체
  - `"Specific_Gravity"`: 비중
  - `"Blood"`: 잠혈
  - `"pH"`: pH
  - `"Protein"`: 단백질
  - `"Nitrite"`: 아질산염
  - `"Leukocytes"`: 백혈구

### `test_name_ko`

- **의미**: 검사 항목의 한국어 이름
- **타입**: `string`
- **예시**: `"유로빌리노겐"`, `"포도당"`, `"빌리루빈"`

### `test_name_en`

- **의미**: 검사 항목의 영어 이름
- **타입**: `string`
- **예시**: `"Urobilinogen"`, `"Glucose"`, `"Bilirubin"`

### `unit`

- **의미**: 검사 항목의 측정 단위
- **타입**: `string`
- **예시**:
  - `"mg/dL (μmol/L)"`
  - `"mg/dL"`
  - `"pH"`
  - `"specific gravity"`

### `matched_value`

- **의미**: 기준 색상표와 비교하여 가장 유사한 값
- **타입**: `string`
- **의미**: 측정된 패드 색상이 기준 색상표 중 어떤 값과 가장 가까운지
- **예시**:
  - `"neg"`: 음성
  - `"2"`, `"4"`, `"8"`: 수치 값
  - `"+"`, `"++"`, `"+++"`: 양성 정도
  - `"1.010"`, `"1.020"`: 비중 값
  - `"6.5"`, `"7"`: pH 값

### `result`

- **의미**: 검사 결과 판정
- **타입**: `string`
- **가능한 값**:
  - `"negative"`: 음성 (정상)
  - `"positive"`: 양성 (비정상)
  - `"trace"`: 미량 (경계선)
  - `"normal"`: 정상 (특정 항목에서만 사용, 예: pH 5, SG 1.000)
  - `"abnormal"`: 비정상 (특정 항목에서만 사용, 예: SG)
  - `"acidic"`: 산성 (pH)
  - `"alkaline"`: 알칼리성 (pH)
  - `"positive_hemolysis"`: 용혈성 양성 (Blood)
  - `"positive_non_hemolysis"`: 비용혈성 양성 (Blood)

### `is_normal`

- **의미**: 정상 여부 (양성/음성 여부)
- **타입**: `boolean`
- **가능한 값**:
  - `true`: 정상 (음성 또는 정상 범위)
  - `false`: 비정상 (양성 또는 비정상 범위)
- **참고**: `result`가 `"negative"` 또는 `"normal"`이면 `true`, 그 외는 `false`

### `severity`

- **의미**: 비정상일 경우의 심각도
- **타입**: `string`
- **가능한 값**:
  - `"N/A"`: 정상이거나 심각도 없음
  - `"trace"`: 미량
  - `"mild"`: 경미
  - `"moderate"`: 중등도
  - `"severe"`: 중증
  - `"very_severe"`: 매우 중증
  - `"low"`: 낮음 (SG에서 사용)
  - `"high"`: 높음 (SG에서 사용)
  - `"slight_acidic"`: 약간 산성 (pH)
  - `"mild_acidic"`: 경미 산성 (pH)
  - `"mild_alkaline"`: 경미 알칼리성 (pH)
  - `"moderate_alkaline"`: 중등도 알칼리성 (pH)
  - `"strong_alkaline"`: 강한 알칼리성 (pH)

### `delta_e`

- **의미**: 색상 차이 값 (Delta E, CIE76)
- **타입**: `number` (float)
- **의미**: 측정된 패드 색상과 기준 색상표 색상 간의 차이
- **해석**:
  - `0 ~ 5`: 거의 동일한 색상 (매우 정확)
  - `5 ~ 15`: 매우 유사한 색상 (정확)
  - `15 ~ 30`: 유사한 색상 (보통)
  - `30 ~ 40`: 다소 다른 색상 (주의 필요)
  - `40 이상`: 매우 다른 색상 (신뢰도 낮음)

### `is_approximate`

- **의미**: 근사치 여부 (Delta E가 임계값 이하인지)
- **타입**: `boolean`
- **가능한 값**:
  - `true`: Delta E < 40 (근사치로 판단 가능)
  - `false`: Delta E >= 40 (근사치 아님, 신뢰도 낮음)
- **용도**: 프론트엔드에서 결과 표시 시 신뢰도 표시에 사용

### `confidence`

- **의미**: 분석 결과의 신뢰도
- **타입**: `string`
- **가능한 값**:
  - `"high"`: Delta E < 20 (높은 신뢰도)
  - `"medium"`: Delta E 20 ~ 40 (중간 신뢰도)
  - `"low"`: Delta E >= 40 (낮은 신뢰도)
- **용도**: 프론트엔드에서 결과 표시 시 신뢰도 표시에 사용

### `suspected_conditions`

- **의미**: 양성일 경우 의심되는 질환 목록
- **타입**: `array` of `string`
- **조건**: `result`가 `"positive"`, `"trace"`, `"abnormal"`, `"acidic"`, `"alkaline"` 등 비정상일 때만 값이 있음
- **예시**:
  ```json
  ["간 질환 (간세포 장애, 담도 폐색)", "황달"]
  ```
- **정상일 때**: 빈 배열 `[]`

---

## 필드 요약표

| 필드명                 | 타입    | 의미             | 예시 값                                 |
| ---------------------- | ------- | ---------------- | --------------------------------------- |
| `test_code`            | string  | 검사 항목 코드   | `"Urobilinogen"`                        |
| `test_name_ko`         | string  | 검사 항목 한글명 | `"유로빌리노겐"`                        |
| `test_name_en`         | string  | 검사 항목 영문명 | `"Urobilinogen"`                        |
| `unit`                 | string  | 측정 단위        | `"mg/dL (μmol/L)"`                      |
| `matched_value`        | string  | 매칭된 기준 값   | `"2"`, `"neg"`, `"+"`                   |
| `result`               | string  | 검사 결과 판정   | `"negative"`, `"positive"`, `"trace"`   |
| `is_normal`            | boolean | 정상 여부        | `true` (정상), `false` (비정상)         |
| `severity`             | string  | 심각도           | `"mild"`, `"moderate"`, `"severe"`      |
| `delta_e`              | number  | 색상 차이 값     | `15.31` (낮을수록 정확)                 |
| `is_approximate`       | boolean | 근사치 여부      | `true` (신뢰 가능), `false` (신뢰 낮음) |
| `confidence`           | string  | 신뢰도           | `"high"`, `"medium"`, `"low"`           |
| `suspected_conditions` | array   | 의심 질환 목록   | `["간 질환", "황달"]`                   |

---

## 프론트엔드 사용 예시

### 1. 정상/비정상 판단

```javascript
if (testResult.is_normal) {
  // 정상 - 초록색 표시
} else {
  // 비정상 - 빨간색 표시
}
```

### 2. 심각도에 따른 색상 표시

```javascript
const getSeverityColor = (severity) => {
  switch (severity) {
    case "mild":
      return "#FFA500"; // 주황색
    case "moderate":
      return "#FF6B00"; // 진한 주황색
    case "severe":
      return "#FF0000"; // 빨간색
    case "very_severe":
      return "#8B0000"; // 진한 빨간색
    default:
      return "#4CAF50"; // 초록색 (정상)
  }
};
```

### 3. 신뢰도 표시

```javascript
if (testResult.confidence === "low") {
  // 경고 아이콘 표시
  // "결과 신뢰도가 낮을 수 있습니다" 메시지
}
```

### 4. 의심 질환 표시

```javascript
if (testResult.suspected_conditions.length > 0) {
  // 의심 질환 목록 표시
  testResult.suspected_conditions.forEach((condition) => {
    console.log(`의심 질환: ${condition}`);
  });
}
```

---

## 오류 응답

```json
{
  "status": "ERROR",
  "message": "이미지 파일을 로드할 수 없습니다: /app/temp_images/xxx.jpg",
  "path": "/app/temp_images/xxx.jpg"
}
```

### 오류 응답 필드

- `status`: `"ERROR"`
- `message`: 오류 메시지
- `path`: 오류가 발생한 파일 경로
