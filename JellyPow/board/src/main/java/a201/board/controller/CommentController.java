package a201.board.controller;

import a201.board.data.request.CommentRequest;
import a201.board.service.CommentService;
import a201.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Comment", description = "댓글 API")
@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @Operation(summary = "댓글 작성", description = "게시글에 댓글을 작성합니다.")
    @PostMapping("/{boardId}")
    public ApiResponse<?> create(@PathVariable Long boardId,@RequestHeader("X-User-Id") Long userId,
                                 @RequestBody CommentRequest commentRequest) {

        commentService.createComment(boardId,userId,commentRequest);
        return ApiResponse.success(null);
    }

    @Operation(summary = "댓글 목록 조회", description = "특정 게시글의 댓글 목록을 조회합니다.")
    @GetMapping("/{boardId}")
    public ApiResponse<?> getCommentsByPost(@PathVariable Long boardId,@RequestHeader("X-User-Id") Long userId) {
        return ApiResponse.success(commentService.getCommentsByPost(boardId,userId));
    }

    @Operation(summary = "댓글 삭제", description = "댓글을 삭제합니다.")
    @DeleteMapping("/{boardId}/{commentId}")
    public ApiResponse<?> delete(@PathVariable Long commentId,@PathVariable Long boardId,@RequestHeader("X-User-Id") Long userId) {
        commentService.deleteComment(commentId,userId,boardId);
        return ApiResponse.success(null);
    }
}

