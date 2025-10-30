package a201.user.domain.auth.dto;

import a201.user.domain.user.dto.UserSignupResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KakaoLoginResponse {

    private boolean needSignup;  // true면 회원가입 필요
    private Long authId;          // Auth ID (회원가입 시 사용)
    private String email;         // 이메일
    private String accessToken;   // JWT 액세스 토큰 (로그인 성공 시)
    private UserSignupResponse user;  // 로그인 성공 시 유저 정보
}

