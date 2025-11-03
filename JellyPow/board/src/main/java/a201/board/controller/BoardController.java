package a201.board.controller;

import a201.board.data.request.BoardRequest;
import a201.board.data.request.BoardUpdateRequest;
import a201.board.data.response.BoardResponse;
import a201.board.service.BoardService;
import a201.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    // TODO:: GET post Visibility 확인/팔로워 유무 확인 필요
    @GetMapping("/{boardId}")
    public ApiResponse<BoardResponse> getPost(@RequestHeader("X-User-Id") Long userId, @PathVariable Long boardId) {

        BoardResponse boardResponse = boardService.getPost(userId,boardId);

        return ApiResponse.success(boardResponse);
    }

    @PostMapping
    public ApiResponse<Void> create(@RequestHeader("X-User-Id") Long userId, @RequestBody BoardRequest boardRequest) {

        boardService.createPost(userId, boardRequest);

        return ApiResponse.success(null);

    }

    @PutMapping("/{boardId}")
    public ApiResponse<Void> update(@RequestHeader("X-User-Id") Long userId, @PathVariable Long boardId, @RequestBody BoardUpdateRequest postRequest) {

        boardService.updatePost(userId,boardId,postRequest);

        return ApiResponse.success(null);
    }

    @DeleteMapping("/{boardId}")
    public ApiResponse<Void> delete(@RequestHeader("X-User-Id") Long userId,@PathVariable Long boardId) {

        boardService.deletePost(userId,boardId);

        return ApiResponse.success(null);
    }






}

