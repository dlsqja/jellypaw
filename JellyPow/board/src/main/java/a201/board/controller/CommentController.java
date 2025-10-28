package a201.board.controller;

import a201.board.data.entity.Comment;
import a201.board.service.CommentService;
import a201.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ApiResponse<Comment> create(@RequestBody Comment comment) {
        return ApiResponse.success(commentService.createComment(comment));
    }

    @GetMapping("/{id}")
    public ApiResponse<Comment> get(@PathVariable Long id) {
        return ApiResponse.success(commentService.getComment(id));
    }

    @GetMapping("/post/{postId}")
    public ApiResponse<List<Comment>> getByPost(@PathVariable Long postId) {
        return ApiResponse.success(commentService.getCommentsByPost(postId));
    }

    @PutMapping
    public ApiResponse<Comment> update(@RequestBody Comment comment) {
        return ApiResponse.success(commentService.updateComment(comment));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ApiResponse.success(null);
    }
}

