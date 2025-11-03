package a201.post.controller;

import a201.post.data.entity.Comment;
import a201.post.data.request.CommentRequest;
import a201.post.service.CommentService;
import a201.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/{postId}")
    public ApiResponse<?> create(@PathVariable Long postId,@RequestBody Long userId,
                                 @RequestBody CommentRequest commentRequest) {

        commentService.createComment(postId,userId,commentRequest);
        return ApiResponse.success(null);
    }

    @GetMapping("/{postId}")
    public ApiResponse<?> getCommentsByPost(@PathVariable Long postId,@RequestBody Long userId) {
        return ApiResponse.success(commentService.getCommentsByPost(postId,userId));
    }

    @GetMapping("/{postId}/{parentId}")
    public ApiResponse<?> getCommentsByParent(@PathVariable Long parentId,@RequestBody Long userId) {
        return ApiResponse.success(commentService.getCommentsByParent(parentId,userId));
    }


    @DeleteMapping("/{postId}/{parentId}")
    public ApiResponse<?> delete(@PathVariable Long commentId,@RequestBody Long userId) {
        commentService.deleteComment(commentId,userId);
        return ApiResponse.success(null);
    }
}

