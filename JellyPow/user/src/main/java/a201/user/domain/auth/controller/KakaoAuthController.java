package a201.user.domain.auth.controller;

import a201.common.response.ApiResponse;
import a201.user.domain.auth.dto.KakaoLoginResponse;
import a201.user.domain.auth.entity.Auth;
import a201.user.domain.auth.repository.AuthRepository;
import a201.user.domain.auth.service.AuthService;
import a201.user.domain.auth.service.KakaoAuthService;
import a201.user.domain.user.dto.UserSignupResponse;
import a201.user.domain.user.entity.User;
import a201.user.domain.user.repository.UserRepository;
import a201.user.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import jakarta.servlet.http.HttpServletResponse;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class KakaoAuthController {

    private final KakaoAuthService kakaoAuthService;
    private final AuthRepository authRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final JwtUtil jwtUtil;
	private final String SignupUrl = "http://localhost:8000/api/auth/kakao/callback";

    // 카카오 로그인 처리 (POST)
    @PostMapping("/kakao")
    public ApiResponse<KakaoLoginResponse> kakaoLoginPost(
		@RequestParam String code,
		HttpServletResponse response
		) throws Exception {
			KakaoLoginResponse res = processKakaoLogin(code);
		if (res.isNeedSignup()) {
			response.sendRedirect(SignupUrl);
		}
        return ApiResponse.success(res);
    }

    // 카카오 콜백 처리 (GET) - 카카오가 직접 호출
    @GetMapping("/kakao/callback")
    	public ApiResponse<KakaoLoginResponse> kakaoLoginCallback(
		@RequestParam String code,
		HttpServletResponse response
		) throws Exception {
			KakaoLoginResponse res = processKakaoLogin(code);
		if (res.isNeedSignup()) {
			response.sendRedirect(SignupUrl);
		}
		
		return ApiResponse.success(res);
	}

    // 실제 로그인 처리 로직
    private KakaoLoginResponse processKakaoLogin(String code) throws IOException {
        try {
            // 1. 카카오 인증 코드로 액세스 토큰 받기
            String accessToken = kakaoAuthService.getAccessToken(code);
            log.info("카카오 액세스 토큰: {}", accessToken);

            // 2. 액세스 토큰으로 사용자 정보 조회
            Map<String, Object> userInfo = kakaoAuthService.getUserInfo(accessToken);
            log.info("카카오 사용자 정보: {}", userInfo);
            
            String email = kakaoAuthService.extractEmail(userInfo);
            log.info("카카오 이메일: {}", email);

            // 3. Auth 테이블 확인
            Optional<Auth> authOptional = authRepository.findByEmail(email);

            if (authOptional.isEmpty()) {
                // Auth 없음 → 처음 사용 → Auth 생성 후 회원가입 필요
                Auth newAuth = authService.createAuth(email);
                
                return KakaoLoginResponse.builder()
                        .needSignup(true)
                        .authId(newAuth.getAuthId())
                        .email(email)
                        .build();
            }

            // 4. Auth 있음 → User 테이블 확인
            Auth auth = authOptional.get();
            Optional<User> userOptional = userRepository.findByAuth_AuthId(auth.getAuthId());

            if (userOptional.isEmpty()) {
                // User 없음 → 회원가입 필요
                return KakaoLoginResponse.builder()
                        .needSignup(true)
                        .authId(auth.getAuthId())
                        .email(email)
                        .build();
            }

            // 5. User 있음 → 로그인 성공
            User user = userOptional.get();
            UserSignupResponse userResponse = UserSignupResponse.from(user);
            
            // JWT 토큰 생성
            String jwtToken = jwtUtil.generateToken(user.getUserId(), user.getRole());
            log.info("JWT 토큰 생성 완료 - userId: {}, role: {}", user.getUserId(), user.getRole());

            return KakaoLoginResponse.builder()
                    .needSignup(false)
                    .authId(auth.getAuthId())
                    .email(email)
                    .accessToken(jwtToken)
                    .user(userResponse)
                    .build();

        } catch (Exception e) {
            log.error("카카오 로그인 실패", e);
            throw new RuntimeException("카카오 로그인 처리 중 오류 발생: " + e.getMessage());
        }
    }
}

