package a201.user.domain.pet.service;

import a201.user.domain.pet.document.AnalysisDocument;
import a201.user.domain.pet.document.AnalysisSummary;
import a201.user.domain.pet.repository.AnalysisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final AnalysisRepository analysisRepository;

    /**
     * 분석 결과를 MongoDB에 저장
     * - MongoDB의 AnalysisDocument에 userId와 petId가 저장되어 있으므로
     *   MongoDB에서 직접 userId로 조회 가능
     */
    public AnalysisDocument saveAnalysis(Long userId, Long petId, Map<String, Object> aiResult) {
        try {
            // MongoDB에 상세 분석 데이터 저장 (userId, petId 포함)
            AnalysisDocument document = convertToDocument(userId, petId, aiResult);
            document.setCreatedAt(LocalDateTime.now());
            AnalysisDocument saved = analysisRepository.save(document);
            
            log.info("분석 결과 저장 완료: mongoId={}, userId={}, petId={}", saved.getId(), userId, petId);
            
            return saved;
        } catch (Exception e) {
            log.error("분석 결과 저장 실패: userId={}, petId={}, error={}", userId, petId, e.getMessage(), e);
            throw new RuntimeException("분석 결과 저장 실패: " + e.getMessage(), e);
        }
    }

    /**
     * MongoDB에서 userId와 petId로 직접 조회
     * - AnalysisDocument에 userId 필드가 저장되어 있으므로 MongoDB에서 직접 조회 가능
     * - Spring Data MongoDB의 메서드 네이밍: findByUserIdAndPetId
     */
    public List<AnalysisDocument> getAnalysisList(Long userId, Long petId) {
		// return analysisRepository.findByUserIdAndPetIdOrderByCreatedAtDesc(userId, petId);
        log.info("분석 결과 조회 요청: userId={} (type: {}), petId={} (type: {})", 
                userId, userId != null ? userId.getClass().getSimpleName() : "null",
                petId, petId != null ? petId.getClass().getSimpleName() : "null");
        
        List<AnalysisDocument> documents = analysisRepository.findByUserIdAndPetIdOrderByCreatedAtDesc(userId, petId);
        
        log.info("조회된 분석 결과 개수: {}", documents.size());
        if (documents.isEmpty()) {
            // 디버깅: 전체 데이터 확인
            long totalCount = analysisRepository.count();
            log.warn("조회 결과가 비어있습니다. MongoDB 전체 문서 개수: {}", totalCount);
        }
        
        return documents;
    }

    /**
     * MongoDB에서 userId로 직접 조회
     * - AnalysisDocument에 userId 필드가 저장되어 있으므로 MongoDB에서 직접 조회 가능
     * - Spring Data MongoDB의 메서드 네이밍: findByUserId
     */
    public List<AnalysisDocument> getAnalysisListByUserId(Long userId) {
        return analysisRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * 특정 분석 결과 조회 (권한 확인 포함)
     * - MongoDB에서 조회 후 userId로 권한 확인
     */
    public AnalysisDocument getAnalysis(String mongoId, Long userId) {
        AnalysisDocument document = analysisRepository.findById(mongoId)
                .orElseThrow(() -> new RuntimeException("분석 결과를 찾을 수 없습니다."));
        
        // MongoDB Document의 userId로 권한 확인
        if (!document.getUserId().equals(userId)) {
            throw new RuntimeException("권한이 없습니다.");
        }
        
        return document;
    }

    private AnalysisDocument convertToDocument(Long userId, Long petId, Map<String, Object> aiResult) {
        try {
            String status = (String) aiResult.get("status");
            Integer analysisCount = ((Number) aiResult.get("analysis_count")).intValue();
            String detailSavedPath = (String) aiResult.get("detail_saved_path");
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> summaryList = (List<Map<String, Object>>) aiResult.get("summary");
            
            List<AnalysisSummary> summary = summaryList.stream()
                    .map(this::convertToSummary)
                    .collect(Collectors.toList());
            
            return AnalysisDocument.builder()
                    .userId(userId)
                    .petId(petId)
                    .status(status)
                    .analysisCount(analysisCount)
                    .summary(summary)
                    .detailSavedPath(detailSavedPath)
                    .build();
        } catch (Exception e) {
            log.error("AI 결과 변환 실패: error={}", e.getMessage(), e);
            throw new RuntimeException("AI 결과 변환 실패: " + e.getMessage(), e);
        }
    }

    private AnalysisSummary convertToSummary(Map<String, Object> summaryMap) {
        @SuppressWarnings("unchecked")
        List<String> suspectedConditions = (List<String>) summaryMap.get("suspected_conditions");
        
        return AnalysisSummary.builder()
                .testCode((String) summaryMap.get("test_code"))
                .testNameKo((String) summaryMap.get("test_name_ko"))
                .testNameEn((String) summaryMap.get("test_name_en"))
                .unit((String) summaryMap.get("unit"))
                .matchedValue(String.valueOf(summaryMap.get("matched_value")))
                .result((String) summaryMap.get("result"))
                .isNormal((Boolean) summaryMap.get("is_normal"))
                .severity((String) summaryMap.get("severity"))
                .deltaE(summaryMap.get("delta_e") != null ? ((Number) summaryMap.get("delta_e")).doubleValue() : null)
                .isApproximate((Boolean) summaryMap.get("is_approximate"))
                .confidence((String) summaryMap.get("confidence"))
                .suspectedConditions(suspectedConditions)
                .build();
    }
}

