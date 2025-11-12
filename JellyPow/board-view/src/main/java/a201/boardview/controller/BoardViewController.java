package a201.boardview.controller;

import a201.boardview.data.dto.BoardSimpleListResponse;
import a201.boardview.data.entity.BoardView;
import a201.boardview.service.BoardViewService;
import a201.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Pageable;
import java.util.List;

@RestController
@RequestMapping("/board-view")
@RequiredArgsConstructor
public class BoardViewController {

    private final BoardViewService boardViewService;
    private final static int PAGE_SIZE = 20;


    @GetMapping
    public ApiResponse<BoardSimpleListResponse> getBoardsPaginated(@RequestHeader("X-User-id") Long userId, @RequestParam(defaultValue = "0") int page) {

        //최신 게시글을 기준으로 가져오려고 한다면
        //여기서 createAt으로만 정렬했을 때 생길 수 있는 문제
        //동시에 쓰여진 게시글이 있다면 내부적인 판단에 의해 임의로 순서가 정해짐
        //게다가 새로운 페이지가 불러올 때마다 정렬되기 때문에 페이지가 바껴도 중복된 결과를 가져올 수 있음
        // -> 그래서 정렬 기준을 2개로 잡았음
        //매번 정렬? 비효율 이거 어떻게 해결 혹은 어떻게 최적화할지 고민할 요소
        //offset 기반 페이지 네이션
        // -> 새로운 게시글이 생성 되었을 때 -> 다음 페이지 요청시 밀려서 중복된 결과를 볼 수 있음
        // -> 해결책 고민 필요
        Sort sort = Sort.by(
                Sort.Order.desc("createdAt"),
                Sort.Order.desc("id")
        );
        Pageable pageable = PageRequest.of(page, PAGE_SIZE, sort);

        List<BoardView> boardList = boardViewService.getBoardsPaginated(pageable);

        return ApiResponse.success(BoardSimpleListResponse.fromEntity(boardList));
    }
}
