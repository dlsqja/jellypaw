package a201.post.controller;

import a201.post.data.request.BoardRequest;
import a201.post.data.request.BoardUpdateRequest;
import a201.post.data.response.BoardResponse;
import a201.post.service.BoardService;
import a201.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {

    private final BoardService boardService;

    // TODO:: GET post Visibility 확인/팔로워 유무 확인 필요
    @GetMapping("/{postId}")
    public ApiResponse<BoardResponse> getPost(@RequestBody Long userId, @PathVariable Long postId) {

        BoardResponse boardResponse = boardService.getPost(userId,postId);

        return ApiResponse.success(boardResponse);
    }

    @PostMapping
    public ApiResponse<Void> create(@RequestBody Long userId, @RequestBody BoardRequest boardRequest) {

        boardService.createPost(userId, boardRequest);

        return ApiResponse.success(null);

    }

    @PutMapping("/{postId}")
    public ApiResponse<Void> update(@RequestBody Long userId, @PathVariable Long postId, @RequestBody BoardUpdateRequest postRequest) {

        boardService.updatePost(userId,postId,postRequest);

        return ApiResponse.success(null);
    }

    @DeleteMapping("/{postId}")
    public ApiResponse<Void> delete(@PathVariable Long userId,@PathVariable Long postId) {

        boardService.deletePost(userId,postId);

        return ApiResponse.success(null);
    }




}

