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

    @PostMapping("/{boardId}")
    public ApiResponse<?> create(@PathVariable Long boardId,@RequestHeader("X-User-Id") Long userId,
                                 @RequestBody CommentRequest commentRequest) {

        commentService.createComment(boardId,userId,commentRequest);
        return ApiResponse.success(null);
    }

    @GetMapping("/{boardId}")
    public ApiResponse<?> getCommentsByPost(@PathVariable Long boardId,@RequestHeader("X-User-Id") Long userId) {
        return ApiResponse.success(commentService.getCommentsByPost(boardId,userId));
    }

    @GetMapping("/{boardId}/{parentId}")
    public ApiResponse<?> getCommentsByParent(@PathVariable Long parentId,@RequestHeader("X-User-Id") Long userId) {
        return ApiResponse.success(commentService.getCommentsByParent(parentId,userId));
    }


    @DeleteMapping("/{boardId}/{parentId}")
    public ApiResponse<?> delete(@PathVariable Long commentId,@RequestHeader("X-User-Id") Long userId) {
        commentService.deleteComment(commentId,userId);
        return ApiResponse.success(null);
    }
}

