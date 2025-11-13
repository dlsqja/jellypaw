package a201.board.controller;

import a201.board.data.request.BoardRequest;
import a201.board.data.request.BoardUpdateRequest;
import a201.board.data.request.PlaceCreateRequest;
import a201.board.data.response.BoardResponse;
import a201.board.service.BoardService;
import a201.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

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

    //TODO:: 임시
    @Operation(summary = "피드 조회", description = "모든 게시글을 조회합니다.")
    @GetMapping
    public ApiResponse<?> getFeeds(@RequestHeader("X-User-Id") Long userId) {

        return ApiResponse.success(boardService.getFeeds());
    }

    @Operation(summary = "게시글 작성", description = "새로운 게시글을 작성합니다.")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Void> create(@RequestHeader("X-User-Id") Long userId,
                                    @RequestPart("boardRequest") BoardRequest boardRequest,
									@RequestPart(value = "placeRequest", required = false) PlaceCreateRequest placeRequest,
                                    @RequestPart(value = "newImages", required = false) List<MultipartFile> newImages) {

        boardRequest.setNewImages(newImages);
        boardService.createPost(userId, boardRequest, placeRequest);

        return ApiResponse.success(null);

    }

    @Operation(summary = "게시글 수정", description = "기존 게시글을 수정합니다.")
    @PutMapping(value = "/{boardId}",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Void> update(@RequestHeader("X-User-Id") Long userId,
                                    @PathVariable Long boardId,
                                    @RequestPart("boardUpdateRequest") BoardUpdateRequest boardUpdateRequest,
									@RequestPart(value = "placeRequest", required = false) PlaceCreateRequest placeRequest,
                                    @RequestPart(value = "newImages", required = false) List<MultipartFile> newImages) {

        boardUpdateRequest.setNewImages(newImages);
        boardService.updatePost(userId,boardId,boardUpdateRequest, placeRequest);

        return ApiResponse.success(null);
    }

    @Operation(summary = "게시글 삭제", description = "게시글을 삭제합니다.")
    @DeleteMapping("/{boardId}")
    public ApiResponse<Void> delete(@RequestHeader("X-User-Id") Long userId,@PathVariable Long boardId) {

        boardService.deletePost(userId,boardId);

        return ApiResponse.success(null);
    }






}

