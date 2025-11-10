package a201.common.enums;

public enum ErrorCode {

    INTERNAL_SERVER_ERROR(500, "서버 내부 오류"),
    INVALID_REQUEST(400, "잘못된 요청"),
    UNAUTHORIZED(401, "인증되지 않은 사용자"),
    FORBIDDEN(403, "권한이 없습니다"),
    NOT_FOUND(404, "데이터를 찾을 수 없습니다"),

	USER_NOT_FOUND(404, "사용자를 찾을 수 없습니다"),
	ALREADY_EXISTS_NICKNAME(400, "이미 존재하는 닉네임입니다"),
	EMAIL_NOT_FOUND(404, "이메일을 찾을 수 없습니다"),
	ALREADY_EXISTS_EMAIL(400, "이미 존재하는 이메일입니다"),

	PLACE_NOT_FOUND(404, "장소를 찾을 수 없습니다"),

	FOLLOW_SELF(400, "자기 자신은 팔로우할 수 없습니다"),
    UNFOLLOW_SELF(400, "자기 자신은 언팔로우할 수 없습니다"),
	ALREADY_FOLLOWING(400, "이미 팔로우한 사용자입니다"),
	NOT_FOLLOWING(400, "팔로우하지 않은 사용자입니다"),

    POST_NOT_FOUND(1001, "게시글을 찾을 수 없습니다"),
    COMMENT_NOT_FOUND(1002, "댓글을 찾을 수 없습니다"),

    TIME_TABLE_NOT_FOUND(404, "해당 날짜에 타임 테이블이 없습니다."),
    TIME_NOT_FOUND(404, "해당 시간을 찾을 수 없습니다."),
    ALREADY_RESERVED_TIME(409, "이미 예약된 시간입니다.");

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

