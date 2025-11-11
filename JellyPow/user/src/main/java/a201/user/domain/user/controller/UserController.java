package a201.user.domain.user.controller;

import a201.common.exception.CustomException;
import a201.common.response.ApiResponse;
import a201.user.domain.user.dto.UserRequest;
import a201.user.domain.user.dto.UserDetailResponse;
import a201.user.domain.user.dto.UserProfileResponse;
import a201.user.domain.user.dto.UserSignupResponse;
import a201.user.domain.user.entity.User;
import a201.user.domain.user.service.UserService;
import a201.user.domain.follow.service.FollowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "User", description = "사용자 관리 API")
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
	private final FollowService followService;

    @Operation(summary = "프로필 수정", description = "사용자 프로필 정보를 수정합니다.")
	@PutMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ApiResponse<UserProfileResponse> updateProfile(
			@RequestHeader("X-User-Id") Long userId,
			@RequestPart("data") UserRequest request,
			@RequestPart(value = "profileImg", required = false) MultipartFile profileImg,
			@RequestPart(value = "backgroundImg", required = false) MultipartFile backgroundImg) {
		try {
			User user = userService.updateProfile(userId, request, profileImg, backgroundImg);
			UserProfileResponse response = UserProfileResponse.from(user);
			return ApiResponse.success(response);
		} catch (CustomException e) {
			return ApiResponse.error(e.getErrorCode());
		}
	}

	@Operation(summary = "프로필 조회", description = "현재 로그인한 사용자의 프로필 정보를 조회합니다.")
	@GetMapping("/profile")
	public ApiResponse<UserProfileResponse> getProfile(@RequestHeader("X-User-Id") Long userId) {
		try {
			User user = userService.getUserById(userId);
			UserProfileResponse response = UserProfileResponse.from(user);
			return ApiResponse.success(response);
		} catch (CustomException e) {
			return ApiResponse.error(e.getErrorCode());
		}
	}

	@Operation(summary = "유저 상세 조회", description = "특정 사용자의 프로필 정보를 조회합니다.")
	@GetMapping("/{targetUserId}")
	public ApiResponse<UserDetailResponse> getUser(@RequestHeader("X-User-Id") Long userId,
		@PathVariable Long targetUserId) {
		try {
			User user = userService.getUserById(targetUserId);
			UserDetailResponse response = UserDetailResponse.from(user);
			response.setIsFollowing(followService.isFollowed(userId, targetUserId));
			response.setIsVisible(true);
			return ApiResponse.success(response);
		} catch (CustomException e) {
			return ApiResponse.error(e.getErrorCode());
		}
	}

	@Operation(summary = "유저 검색 (prefix)", description = "닉네임 접두사 검색 (LIKE 'nickname%')")
	@GetMapping("/search")
	public ApiResponse<List<UserDetailResponse>> searchUsers(@RequestParam String nickname) {
		try {
			List<User> users = userService.searchUsers(nickname);
			return ApiResponse.success(users.stream().map(UserDetailResponse::from).collect(Collectors.toList()));
		} catch (CustomException e) {
			return ApiResponse.error(e.getErrorCode());
		}
	}

	@Operation(summary = "유저 검색 (포함 검색)", description = "닉네임 포함 검색 (LIKE '%nickname%')")
	@GetMapping("/search/like")
	public ApiResponse<List<UserDetailResponse>> searchUsersLike(@RequestParam String nickname) {
		try {
			List<User> users = userService.searchUsersLike(nickname);
			return ApiResponse.success(users.stream().map(UserDetailResponse::from).collect(Collectors.toList()));
		} catch (CustomException e) {
			return ApiResponse.error(e.getErrorCode());
		}
	}
}

