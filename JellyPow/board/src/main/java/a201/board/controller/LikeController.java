package a201.board.controller;

import a201.board.data.entity.Like;
import a201.board.service.LikeService;
import a201.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Like", description = "좋아요 API")
@RestController
@RequestMapping("/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @Operation(summary = "좋아요 추가", description = "게시글에 좋아요를 추가합니다.")
    @PostMapping("/{boardId}")
    public ApiResponse<?> add(@PathVariable Long boardId,@RequestHeader("X-User-Id") Long userId) {
        likeService.addLike(boardId,userId);
        return ApiResponse.success(null);
    }

    @Operation(summary = "좋아요 취소", description = "게시글의 좋아요를 취소합니다.")
    @DeleteMapping("/{boardId}")
    public ApiResponse<?> remove(@PathVariable Long boardId,@RequestHeader("X-User-Id") Long userId) {
        likeService.removeLike(boardId,userId);
        return ApiResponse.success(null);
    }

    @Operation(summary = "내가 좋아요한 게시글 조회", description = "현재 사용자가 좋아요한 게시글 목록을 조회합니다.")
    @GetMapping("/my")
    public ApiResponse<?> getByUser(@RequestHeader("X-User-Id") Long userId) {
        List<Like> likes = likeService.getLikesByMe(userId);
        return ApiResponse.success(likes);
    }
}

