package a201.user.domain.pet.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * 각 검사 항목의 상세 정보
 * AI 서버의 summary 배열의 각 요소와 매핑
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisSummary {
    private String testCode;  // "Urobilinogen"
    private String testNameKo;  // "유로빌리노겐"
    private String testNameEn;  // "Urobilinogen"
    private String unit;  // "mg/dL (μmol/L)"
    private String matchedValue;  // "4"
    private String result;  // "positive"
    private Boolean isNormal;  // false
    private String severity;  // "moderate"
    private Double deltaE;  // 15.42
    private Boolean isApproximate;  // true
    private String confidence;  // "high"
    private List<String> suspectedConditions;  // ["간 기능 저하", ...]
}

