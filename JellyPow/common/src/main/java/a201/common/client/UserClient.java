package a201.common.client;

import a201.common.client.dto.UserResponseDto;
import a201.common.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
public class UserClient {

    private final RestClient restClient;

    public UserClient(
            @Value("${client.user-service.url}") String userServiceUrl
    ) {
        this.restClient = RestClient.builder()
                .baseUrl(userServiceUrl)
                .build();
    }

    public UserResponseDto getUser(Long userId) {
        try {
            // log.info("User 서버 API 호출: userId={}", userId);
            
            ApiResponse<UserResponseDto> apiResponse = this.restClient.get()
                    .uri("/api/users/backend/{userId}", userId)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (request, response1) -> {
                        log.warn("User 서버 4xx 에러: userId={}, status={}", userId, response1.getStatusCode());
                        throw new RuntimeException("User 서버 클라이언트 에러: " + response1.getStatusCode());
                    })
                    .onStatus(HttpStatusCode::is5xxServerError, (request, response1) -> {
                        log.error("User 서버 5xx 에러: userId={}, status={}", userId, response1.getStatusCode());
                        throw new RuntimeException("User 서버 서버 에러: " + response1.getStatusCode());
                    })
                    .body(new org.springframework.core.ParameterizedTypeReference<ApiResponse<UserResponseDto>>() {});
            
            if (apiResponse.getCode() != 200 || apiResponse.getData() == null) {
                log.warn("User 서버 응답 오류: userId={}, code={}, message={}", userId, apiResponse.getCode(), apiResponse.getMessage());
                throw new RuntimeException("User 서버 응답 오류: " + apiResponse.getMessage());
            }
            
            // log.info("User 서버에서 사용자 정보 조회 성공: userId={}", userId);
            return apiResponse.getData();
        } catch (Exception e) {
            log.error("User 서버 통신 실패: userId={}, error={}", userId, e.getMessage(), e);
            throw new RuntimeException("User 서버 통신 실패: " + e.getMessage(), e);
        }
    }
}

