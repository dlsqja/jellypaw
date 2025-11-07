package a201.user.domain.public_api.controller;

import a201.common.exception.CustomException;
import a201.common.response.ApiResponse;
import a201.user.domain.user.dto.UserRequest;
import a201.user.domain.user.dto.UserSignupResponse;
import a201.user.domain.user.entity.User;
import a201.user.domain.user.service.UserService;
import a201.user.global.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Public User", description = "공개 사용자 API (인증 불필요)")
@Slf4j
@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class PublicUserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @Operation(summary = "회원가입", description = "새로운 사용자를 등록합니다.")
    @PostMapping("/signup")
    public ApiResponse<UserSignupResponse> signup(@RequestBody UserRequest request) {
        try {
            UserSignupResponse response = userService.signup(request);
            
            // JWT 토큰 생성
            String jwtToken = jwtUtil.generateToken(response.getUserId(), response.getRole());
            log.info("회원가입 완료 - JWT 토큰 생성 - userId: {}, role: {}", response.getUserId(), response.getRole());
            
            // 토큰을 포함한 응답 반환
            UserSignupResponse responseWithToken = UserSignupResponse.from(
                User.builder()
                    .id(response.getUserId())
                    .nickname(response.getNickname())
                    .description(response.getDescription())
                    .profileImg(response.getProfileImg())
                    .backgroundImg(response.getBackgroundImg())
                    .role(response.getRole())
                    .build(),
                jwtToken
            );
            
            return ApiResponse.success(responseWithToken);
        } catch (CustomException e) {
            return ApiResponse.error(e.getErrorCode());
        }
    }

    @Operation(summary = "닉네임 중복 확인", description = "닉네임의 중복 여부를 확인합니다.")
    @GetMapping("/check-nickname")
    public ApiResponse<Boolean> checkNicknameDuplicate(@RequestParam String nickname) {
        boolean isDuplicate = userService.isNicknameDuplicate(nickname);
        return ApiResponse.success(isDuplicate);
    }

	@Operation(summary = "인증 ID로 이메일 조회", description = "인증 ID를 통해 이메일을 조회합니다.")
	@GetMapping("/get-email/{authId}")
	public ApiResponse<String> getEmail(@PathVariable Long authId) {
		String email = userService.getEmailByAuthId(authId);
		return ApiResponse.success(email);
	}
}

