package a201.board.controller;

import a201.board.data.request.CommentRequest;
import a201.board.service.CommentService;
import a201.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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

    @DeleteMapping("/{boardId}/{parentId}")
    public ApiResponse<?> delete(@PathVariable Long parentId,@RequestHeader("X-User-Id") Long userId) {
        commentService.deleteComment(parentId,userId);
        return ApiResponse.success(null);
    }
}

