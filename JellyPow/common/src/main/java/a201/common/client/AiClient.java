package a201.common.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Component
public class AiClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String aiServiceUrl;

    public AiClient(
            @Value("${client.ai-service.url}") String aiServiceUrl
    ) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.aiServiceUrl = aiServiceUrl;
    }

    public Map<String, Object> analyzeImage(MultipartFile file) {
        try {
            log.info("AI 서버 이미지 분석 요청: filename={}, size={}, contentType={}", 
                    file.getOriginalFilename(), file.getSize(), file.getContentType());
            
            // 파일 유효성 검사
            if (file.isEmpty()) {
                throw new RuntimeException("업로드된 파일이 비어있습니다.");
            }
            
            // MultipartFile을 Resource로 변환
            Resource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            
            // MultiValueMap을 사용하여 multipart 요청 생성
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            HttpHeaders fileHeaders = new HttpHeaders();
            
            // Content-Type 설정
            if (file.getContentType() != null && !file.getContentType().isEmpty()) {
                fileHeaders.setContentType(MediaType.parseMediaType(file.getContentType()));
            } else {
                fileHeaders.setContentType(MediaType.IMAGE_JPEG);
                log.warn("Content-Type이 없어 기본값(image/jpeg)을 사용합니다.");
            }
            
            HttpEntity<Resource> fileEntity = new HttpEntity<>(resource, fileHeaders);
            body.add("file", fileEntity);
            
            // 요청 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            
            // 요청 전송
            ResponseEntity<String> response = restTemplate.exchange(
                    aiServiceUrl + "/analyze",
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );
            
            // 응답 상태 코드 확인
            if (response.getStatusCode().is4xxClientError()) {
                log.error("AI 서버 4xx 에러: status={}, body={}", response.getStatusCode(), response.getBody());
                throw new RuntimeException("AI 서버 클라이언트 에러: " + response.getStatusCode() + " - " + response.getBody());
            }
            
            if (response.getStatusCode().is5xxServerError()) {
                log.error("AI 서버 5xx 에러: status={}, body={}", response.getStatusCode(), response.getBody());
                throw new RuntimeException("AI 서버 서버 에러: " + response.getStatusCode() + " - " + response.getBody());
            }
            
            // JSON 응답을 Map으로 변환
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            @SuppressWarnings("unchecked")
            Map<String, Object> result = objectMapper.convertValue(jsonNode, Map.class);
            
            log.info("AI 서버 이미지 분석 성공: detections={}", result.get("analysis_count"));
            return result;
            
        } catch (IOException e) {
            log.error("AI 서버 통신 실패: error={}", e.getMessage(), e);
            throw new RuntimeException("AI 서버 통신 실패: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("AI 서버 이미지 분석 실패: error={}", e.getMessage(), e);
            throw new RuntimeException("AI 서버 이미지 분석 실패: " + e.getMessage(), e);
        }
    }
}

