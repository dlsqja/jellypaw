package a201.board.controller;

import a201.board.data.response.BoardResponse;
import a201.board.service.RedisService;
import a201.common.response.ApiResponse;
import a201.common.util.JsonUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Redis", description = "Redis 저장/조회 API")
@RestController
@RequestMapping("/redis")
@RequiredArgsConstructor
public class RedisController {

    private final RedisService redisService;

    @Operation(summary = "게시글 정보 저장", description = "X-User-Id를 key로 하여 게시글 정보를 JSON으로 저장합니다.")
    @PostMapping("/save")
    public ApiResponse<Void> saveRequest(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody Object request) {
        
        String jsonValue = JsonUtil.toJsonString(request);
        redisService.saveRequest(userId, jsonValue);
        
        return ApiResponse.success(null);
    }

    @Operation(summary = "redis에 저장된 게시글 조회", description = "X-User-Id를 key로 하여 저장된 게시글 정보를 조회합니다.")
    @GetMapping("/get")
    public ApiResponse<BoardResponse> getRequest(@RequestHeader("X-User-Id") Long userId) {
        String jsonValue = redisService.getRequest(userId);
        
        if (jsonValue == null) {
            return ApiResponse.success(null);
        }
        
        BoardResponse result = JsonUtil.fromJsonString(jsonValue, BoardResponse.class);
        return ApiResponse.success(result);
    }

    @Operation(summary = "Request 삭제", description = "X-User-Id를 key로 하여 저장된 request를 삭제합니다.")
    @DeleteMapping("/delete")
    public ApiResponse<Void> deleteRequest(@RequestHeader("X-User-Id") Long userId) {
        redisService.deleteRequest(userId);
        return ApiResponse.success(null);
    }
}

