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

    // 언팔로우 하기
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

    // 팔로워 목록 조회 (나를 팔로우하는 사람들)
    @GetMapping("/followers/{nickname}")
    public ApiResponse<List<FollowUserResponse>> getFollowers(@PathVariable String nickname) {
        try {
            List<FollowUserResponse> followers = followService.getFollowers(nickname);
            return ApiResponse.success(followers);
        } catch (CustomException e) {
            return ApiResponse.error(e.getErrorCode());
        }
    }

    // 팔로잉 목록 조회 (내가 팔로우하는 사람들)
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

