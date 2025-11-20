package a201.common.exception;

import a201.common.enums.ErrorCode;
import a201.common.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @Value("${spring.profiles.active:prod}")
    private String activeProfile;

    @ExceptionHandler(CustomException.class)
    public ApiResponse<?> handleCustomException(CustomException ex) {
        log.warn("CustomException 발생: {}", ex.getMessage());
        return ApiResponse.error(ex.getErrorCode());
    }

    @ExceptionHandler(Exception.class)
    public ApiResponse<?> handleException(Exception ex) {
        // 항상 로그 출력 (stack trace 포함)
        log.error("서버 오류 발생: {}", ex.getMessage(), ex);
        
        // 개발 환경에서는 실제 에러 메시지 반환
        if ("local".equals(activeProfile)) {
            String detailMessage = ex.getClass().getSimpleName() + ": " + ex.getMessage();
            return new ApiResponse<>(500, detailMessage, null);
        }
        
        // 프로덕션에서는 일반 메시지만
        return ApiResponse.error(ErrorCode.INTERNAL_SERVER_ERROR);
    }
}
