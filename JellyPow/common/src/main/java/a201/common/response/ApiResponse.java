package a201.common.response;

import a201.common.enums.ErrorCode;

public class ApiResponse<T> {
    private int code;
    private String message;
    private T data;


    public ApiResponse(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(200, "OK", data);
    }

    public static <T> ApiResponse<T> error(ErrorCode errorCode) {
        return new ApiResponse<>(errorCode.getCode(), errorCode.getMessage(), null);
    }
}
