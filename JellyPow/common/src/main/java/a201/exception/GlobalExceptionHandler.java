package a201.exception;

import a201.enums.ErrorCode;
import a201.response.ApiResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ApiResponse<?> handleException(Exception ex) {
        return ApiResponse.error(ErrorCode.INTERNAL_SERVER_ERROR);
    }
}
