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

    @PostMapping
    public ApiResponse<Like> add(@RequestBody Like like) {
        return ApiResponse.success(likeService.addLike(like));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> remove(@PathVariable Long id) {
        likeService.removeLike(id);
        return ApiResponse.success(null);
    }

    @GetMapping("/post/{postId}")
    public ApiResponse<List<Like>> getByPost(@PathVariable Long postId) {
        return ApiResponse.success(likeService.getLikesByPost(postId));
    }
}

