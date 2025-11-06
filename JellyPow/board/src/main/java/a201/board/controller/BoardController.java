package a201.board.controller;

import a201.board.data.request.BoardRequest;
import a201.board.data.request.BoardUpdateRequest;
import a201.board.data.response.BoardResponse;
import a201.board.service.BoardService;
import a201.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Board", description = "게시판 API")
@RestController
@RequestMapping("/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @Operation(summary = "게시글 조회", description = "특정 게시글을 조회합니다.")
    @GetMapping("/{boardId}")
    public ApiResponse<BoardResponse> getPost(@RequestHeader("X-User-Id") Long userId, @PathVariable Long boardId) {

        BoardResponse boardResponse = boardService.getPost(userId,boardId);

        return ApiResponse.success(boardResponse);
    }

    @Operation(summary = "게시글 작성", description = "새로운 게시글을 작성합니다.")
    @PostMapping
    public ApiResponse<Void> create(@RequestHeader("X-User-Id") Long userId, @RequestBody BoardRequest boardRequest) {

        boardService.createPost(userId, boardRequest);

        return ApiResponse.success(null);

    }

    @Operation(summary = "게시글 수정", description = "기존 게시글을 수정합니다.")
    @PutMapping("/{boardId}")
    public ApiResponse<Void> update(@RequestHeader("X-User-Id") Long userId, @PathVariable Long boardId, @RequestBody BoardUpdateRequest postRequest) {

        boardService.updatePost(userId,boardId,postRequest);

        return ApiResponse.success(null);
    }

    @Operation(summary = "게시글 삭제", description = "게시글을 삭제합니다.")
    @DeleteMapping("/{boardId}")
    public ApiResponse<Void> delete(@RequestHeader("X-User-Id") Long userId,@PathVariable Long boardId) {

        boardService.deletePost(userId,boardId);

        return ApiResponse.success(null);
    }






}

