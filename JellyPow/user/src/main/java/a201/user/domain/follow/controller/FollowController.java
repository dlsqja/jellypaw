package a201.user.domain.follow.controller;

import a201.common.response.ApiResponse;
import a201.common.exception.CustomException;
import a201.user.domain.follow.dto.FollowUserResponse;
import a201.user.domain.follow.service.FollowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Follow", description = "팔로우 관리 API")
@RestController
@RequestMapping("/users/follow")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    @Operation(summary = "팔로우", description = "특정 사용자를 팔로우합니다.")
    @PostMapping("/{nickname}")
    public ApiResponse<Void> follow(
            @RequestHeader("X-User-Id") Long fromUserId,
            @PathVariable String nickname) {
        try {
            followService.follow(fromUserId, nickname);
            return ApiResponse.success(null);
        } catch (CustomException e) {
            return ApiResponse.error(e.getErrorCode());
        }
    }

    @Operation(summary = "언팔로우", description = "특정 사용자를 언팔로우합니다.")
    @DeleteMapping("/{nickname}")
    public ApiResponse<Void> unfollow(
            @RequestHeader("X-User-Id") Long fromUserId,
            @PathVariable String nickname) {
        try {
            followService.unfollow(fromUserId, nickname);
            return ApiResponse.success(null);
        } catch (CustomException e) {
            return ApiResponse.error(e.getErrorCode());
        }
    }

    @Operation(summary = "팔로워 목록 조회", description = "특정 사용자를 팔로우하는 사용자 목록을 조회합니다.")
    @GetMapping("/followers/{nickname}")
    public ApiResponse<List<FollowUserResponse>> getFollowers(@PathVariable String nickname) {
        try {
			System.out.println("팔로워 목록 조회 nickname: " + nickname);
            List<FollowUserResponse> followers = followService.getFollowers(nickname);
			if (!followers.isEmpty()) {
				FollowUserResponse followUserResponse = followers.get(0);
				System.out.println("팔로워 목록 조회 followers: " + followers.get(0).getUserId());
				System.out.println("팔로워 목록 조회 followers: " + followers.get(0).getNickname());
				System.out.println("팔로워 목록 조회 followers: " + followers.get(0).getProfileImg());
			}
            return ApiResponse.success(followers);
        } catch (CustomException e) {
            return ApiResponse.error(e.getErrorCode());
        }
    }

    @Operation(summary = "팔로잉 목록 조회", description = "특정 사용자가 팔로우하는 사용자 목록을 조회합니다.")
    @GetMapping("/followings/{nickname}")
    public ApiResponse<List<FollowUserResponse>> getFollowings(@PathVariable String nickname) {
        try {
            List<FollowUserResponse> followings = followService.getFollowings(nickname);
            return ApiResponse.success(followings);
        } catch (CustomException e) {
            return ApiResponse.error(e.getErrorCode());
        }
    }
}

