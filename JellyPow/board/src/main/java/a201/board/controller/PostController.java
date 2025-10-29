package a201.board.controller;

import a201.board.data.entity.Post;
import a201.board.data.request.PostRequest;
import a201.board.data.request.PostUpdateRequest;
import a201.board.service.PostService;
import a201.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public ApiResponse<Void> create(@RequestBody Long userId, @RequestBody PostRequest postRequest) {

        postService.createPost(userId, postRequest);

        return ApiResponse.success(null);

    }

    @PutMapping("/{postId}")
    public ApiResponse<Void> update(@RequestBody Long userId, @PathVariable Long postId, @RequestBody PostUpdateRequest postRequest) {

        postService.updatePost(userId,postId,postRequest);

        return ApiResponse.success(null);
    }

    @DeleteMapping("/{postId}")
    public ApiResponse<Void> delete(@PathVariable Long userId,@PathVariable Long postId) {

        postService.deletePost(userId,postId);

        return ApiResponse.success(null);
    }
}

