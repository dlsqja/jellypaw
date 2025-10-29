package a201.board.controller;

import a201.board.data.entity.Post;
import a201.board.data.request.PostRequest;
import a201.board.data.response.PostResponse;
import a201.board.service.PostService;
import a201.enums.ErrorCode;
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

    @GetMapping("/{id}")
    public ApiResponse<Post> get(@PathVariable Long id) {
        return ApiResponse.success(postService.getPost(id));
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<Post>> getByUser(@PathVariable Long userId) {
        return ApiResponse.success(postService.getPostsByUser(userId));
    }

    @PutMapping
    public ApiResponse<Post> update(@RequestBody Post post) {
        return ApiResponse.success(postService.updatePost(post));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        postService.deletePost(id);
        return ApiResponse.success(null);
    }
}

