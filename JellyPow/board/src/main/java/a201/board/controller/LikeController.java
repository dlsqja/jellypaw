package a201.board.controller;

import a201.board.data.entity.Like;
import a201.board.service.LikeService;
import a201.response.ApiResponse;
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

