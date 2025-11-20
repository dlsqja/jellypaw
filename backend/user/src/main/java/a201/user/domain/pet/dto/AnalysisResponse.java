package a201.user.domain.pet.dto;

import a201.user.domain.pet.document.AnalysisDocument;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 클라이언트에게 반환할 분석 결과 DTO
 * - 필요한 필드만 포함 (test_name_ko, is_normal, severity, suspected_conditions)
 * - 불필요한 정보는 제외하여 응답 크기 최소화
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisResponse {

    private String id;
    private Long userId;
    private Long petId;
    private String status;
    private Integer analysisCount;
    private List<AnalysisSummaryResponse> summary;
    private String createdAt;
    
    /**
     * AnalysisDocument를 AnalysisResponse로 변환
     * - Document의 모든 필드를 저장하지만, Response는 필요한 필드만 반환
     */
    public static AnalysisResponse from(AnalysisDocument document) {
        List<AnalysisSummaryResponse> summaryList = document.getSummary().stream()
                .map(summary -> AnalysisSummaryResponse.builder()
                        .testNameKo(summary.getTestNameKo())
                        .isNormal(summary.getIsNormal())
                        .severity(summary.getSeverity())
                        .result(summary.getResult())
                        .unit(summary.getUnit())
                        .suspectedConditions(summary.getSuspectedConditions())
                        .build())
                .collect(Collectors.toList());
        
        return AnalysisResponse.builder()
                .id(document.getId())
                .userId(document.getUserId())
                .petId(document.getPetId())
                .status(document.getStatus())
                .analysisCount(document.getAnalysisCount())
                .summary(summaryList)
                .createdAt(document.getCreatedAt() != null ? document.getCreatedAt().toString() : null)
                .build();
    }
}

