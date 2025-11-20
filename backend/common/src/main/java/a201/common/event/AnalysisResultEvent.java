package a201.common.event;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class AnalysisResultEvent {

    @JsonProperty("request_id")
    private String requestId;  // 요청 ID (UUID)
    
    @JsonProperty("userId")
    private Long userId;  // 사용자 ID
    
    @JsonProperty("petId")
    private Long petId;  // 반려동물 ID
    
    private String status;  // "SUCCESS" or "ERROR"
    
    private Map<String, Object> result;  // 성공 시 AI 분석 결과 (Map 형태)
    
    private String error;  // 에러 시 에러 메시지
}

