package a201.user.domain.user.controller;

import a201.common.exception.CustomException;
import a201.common.response.ApiResponse;
import a201.user.domain.user.dto.UserRequest;
import a201.user.domain.user.dto.UserSignupResponse;
import a201.user.domain.user.entity.User;
import a201.user.domain.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "User", description = "사용자 관리 API")
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "프로필 수정", description = "사용자 프로필 정보를 수정합니다.")
	@PutMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ApiResponse<UserSignupResponse> updateProfile(
			@RequestHeader("X-User-Id") Long userId,
			@RequestPart("data") UserRequest request,
			@RequestPart(value = "profileImg", required = false) MultipartFile profileImg,
			@RequestPart(value = "backgroundImg", required = false) MultipartFile backgroundImg) {
		try {
			UserSignupResponse response = userService.updateProfile(userId, request, profileImg, backgroundImg);
			return ApiResponse.success(response);
		} catch (CustomException e) {
			return ApiResponse.error(e.getErrorCode());
		}
	}

	@Operation(summary = "프로필 조회", description = "현재 로그인한 사용자의 프로필 정보를 조회합니다.")
	@GetMapping("/profile")
	public ApiResponse<UserSignupResponse> getProfile(@RequestHeader("X-User-Id") Long userId) {
		try {
			User user = userService.getUserById(userId);
			UserSignupResponse response = UserSignupResponse.from(user);
			return ApiResponse.success(response);
		} catch (CustomException e) {
			return ApiResponse.error(e.getErrorCode());
		}
	}
}

