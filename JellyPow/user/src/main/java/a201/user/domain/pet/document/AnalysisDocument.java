package a201.user.domain.pet.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

/**
 * MongoDB에 저장할 분석 결과 Document
 * - AI 서버에서 받은 전체 데이터를 저장 (모든 필드 포함)
 * - userId, petId, createdAt은 우리가 추가한 필드
 * - userId와 petId에 인덱스를 추가하여 조회 성능 향상
 */
@Document(collection = "pet_analysis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisDocument {

    @Id
    private String id;  // MongoDB 자동 생성 ID
    
    // 우리가 추가한 필드 (인덱스 추가로 조회 성능 향상)
    @Indexed
    private Long userId;  // MongoDB에서 userId로 직접 조회 가능
    
    @Indexed
    private Long petId;  // MongoDB에서 petId로 직접 조회 가능
    
    private LocalDateTime createdAt;
    
    // AI 서버에서 받은 필드들
    private String status;  // "SUCCESS"
    private Integer analysisCount;  // 10
    private List<AnalysisSummary> summary;  // 분석 항목 리스트
    private String detailSavedPath;  // 상세 결과 파일 경로
}

