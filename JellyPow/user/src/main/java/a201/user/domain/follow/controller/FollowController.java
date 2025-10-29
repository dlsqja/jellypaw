package a201.user.domain.follow.controller;

import a201.common.response.ApiResponse;
import a201.common.exception.CustomException;
import a201.user.domain.follow.dto.FollowUserResponse;
import a201.user.domain.follow.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/follow")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    // 팔로우 하기
    @PostMapping("/{to_user_id}")
    public ApiResponse<Void> follow(
            @RequestParam Long fromUserId,
            @PathVariable String nickname) {
        try {
            followService.follow(fromUserId, nickname);
            return ApiResponse.success(null);
        } catch (CustomException e) {
            return ApiResponse.error(e.getErrorCode());
        }
    }

    // 언팔로우 하기
    @DeleteMapping("/{to_user_id}")
    public ApiResponse<Void> unfollow(
            @RequestParam Long fromUserId,
            @PathVariable Long to_user_id) {
        try {
            followService.unfollow(fromUserId, to_user_id);
            return ApiResponse.success(null);
        } catch (CustomException e) {
            return ApiResponse.error(e.getErrorCode());
        }
    }

    // 팔로워 목록 조회 (나를 팔로우하는 사람들)
    @GetMapping("/followers/{user_id}")
    public ApiResponse<List<FollowUserResponse>> getFollowers(@PathVariable Long user_id) {
        try {
            List<FollowUserResponse> followers = followService.getFollowers(user_id);
            return ApiResponse.success(followers);
        } catch (CustomException e) {
            return ApiResponse.error(e.getErrorCode());
        }
    }

    // 팔로잉 목록 조회 (내가 팔로우하는 사람들)
    @GetMapping("/followings/{user_id}")
    public ApiResponse<List<FollowUserResponse>> getFollowings(@PathVariable Long user_id) {
        try {
            List<FollowUserResponse> followings = followService.getFollowings(user_id);
            return ApiResponse.success(followings);
        } catch (CustomException e) {
            return ApiResponse.error(e.getErrorCode());
        }
    }
}

