package a201.boardview.controller;

import a201.boardview.service.BoardViewService;
import a201.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Feed", description = "피드 API")
@RestController
@RequestMapping("/Feeds")
@RequiredArgsConstructor
public class ViewController {

    private final BoardViewService boardViewService;

    @GetMapping
    public ApiResponse<?> getFeeds(@RequestHeader("X-User-Id") Long userId) {


        return ApiResponse.success(boardViewService.getFeeds(userId));
    }


}
