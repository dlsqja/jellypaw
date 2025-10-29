package a201.common.enums;

public enum ErrorCode {

    INTERNAL_SERVER_ERROR(500, "서버 내부 오류"),
    INVALID_REQUEST(400, "잘못된 요청"),
    UNAUTHORIZED(401, "인증되지 않은 사용자"),
    FORBIDDEN(403, "권한이 없습니다"),
    NOT_FOUND(404, "데이터를 찾을 수 없습니다"),

    POST_NOT_FOUND(1001, "게시글을 찾을 수 없습니다"),
    COMMENT_NOT_FOUND(1002, "댓글을 찾을 수 없습니다");

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}

