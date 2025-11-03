package a201.post.controller;

import a201.post.data.entity.Like;
import a201.post.service.LikeService;
import a201.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/{boardId}")
    public ApiResponse<?> add(@PathVariable Long boardId,@RequestHeader("X-User-Id") Long userId) {
        likeService.addLike(boardId,userId);
        return ApiResponse.success(null);
    }

    @DeleteMapping("/{boardId}")
    public ApiResponse<?> remove(@PathVariable Long boardId,@RequestHeader("X-User-Id") Long userId) {
        likeService.removeLike(boardId,userId);
        return ApiResponse.success(null);
    }

    @GetMapping("/my")
    public ApiResponse<?> getByUser(@RequestHeader("X-User-Id") Long userId) {
        List<Like> likes = likeService.getLikesByMe(userId);
        return ApiResponse.success(likes);
    }
}

