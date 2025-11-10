package a201.boardview.controller;

import a201.boardview.data.dto.BoardSimpleListResponse;
import a201.boardview.data.entity.BoardView;
import a201.boardview.service.BoardViewService;
import a201.common.enums.Category;
import a201.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.awt.print.Pageable;
import java.util.List;

@RestController
@RequestMapping("/boards")
@RequiredArgsConstructor
public class ViewController {

    private final BoardViewService boardViewService;
private final int PAGE_SIZE = 20;


    @GetMapping
    public ApiResponse<BoardSimpleListResponse> getBoardsPaginated(@RequestParam int page) {

        Pageable pageable = PageRequest.of(page, PAGE_SIZE, Sort.by("createdAt").descending());

        List<BoardView> boardList = boardViewService.getBoardsPaginated();

        return ApiResponse.success(BoardSimpleListResponse.fromEntity(boardList));
    }


}
