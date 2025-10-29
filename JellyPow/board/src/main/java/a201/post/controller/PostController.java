package a201.post.controller;

import a201.post.data.request.PostRequest;
import a201.post.data.request.PostUpdateRequest;
import a201.post.service.PostService;
import a201.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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

