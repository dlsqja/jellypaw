package a201.user.domain.pet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * 각 검사 항목의 요약 정보 (필요한 필드만)
 * - testNameKo: 검사 항목 한글명
 * - isNormal: 정상 여부
 * - severity: 심각도
 * - suspectedConditions: 의심 질환 목록
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisSummaryResponse {
    private String testNameKo;  // "유로빌리노겐"
    private Boolean isNormal;  // false
    private String severity;  // "moderate"
    private List<String> suspectedConditions;  // ["간 기능 저하", ...]
}

