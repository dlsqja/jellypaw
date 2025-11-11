package a201.boardview.service;

import a201.boardview.data.entity.*;
import a201.boardview.repository.*;
import a201.common.event.BoardCreateEvent;
import a201.common.event.BoardUpdateEvent;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class BoardViewService {

    private final BoardViewRepository boardViewRepository;
    private final BoardUserRepository boardUserRepository;

    private final ViewRepository viewRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    @Transactional
    public void createBoard(BoardCreateEvent boardCreateEvent) {

        if (boardViewRepository.existsById(boardCreateEvent.getId())) {
            log.warn("이미 존재하는 게시글: {}", boardCreateEvent.getId());
            return;
        }

        BoardUser findUser =  boardUserRepository.findById(boardCreateEvent.getUserId()).orElseThrow(() -> new EntityNotFoundException("User Not Found"));




        BoardView boardView = BoardView.builder()
                .id(boardCreateEvent.getId())
                .userId(findUser)
                .category(boardCreateEvent.getCategory())
                .title(boardCreateEvent.getTitle())
                .content(boardCreateEvent.getContent())
                .placeId(boardCreateEvent.getPlaceId())
                .createdAt(boardCreateEvent.getCreatedAt())
                .visibility(boardCreateEvent.getVisibility())
                .starRating(boardCreateEvent.getStarRating())
                .thumbnail(boardCreateEvent.getThumbnail())
                .build();

        boardView.initializeCounts();

        boardViewRepository.save(boardView);
        log.info("Board 생성: boardId={}", boardView.getId());
    }

    public void updateBoard(BoardUpdateEvent boardUpdateEvent) {

        BoardView boardView = boardViewRepository.findById(boardUpdateEvent.getId()).orElseThrow(() -> new EntityNotFoundException("Board Not Found"));

        boardView.setCategory(boardUpdateEvent.getCategory());
        boardView.setTitle(boardUpdateEvent.getTitle());
        boardView.setContent(boardUpdateEvent.getContent());
        boardView.setPlaceId(boardUpdateEvent.getPlaceId());
        boardView.setStarRating(boardUpdateEvent.getStarRating());
        boardView.setVisibility(boardUpdateEvent.getVisibility());
        boardView.setThumbnail(boardUpdateEvent.getThumbnail());

        boardViewRepository.save(boardView);

        log.info("Board 업데이트: boardId={}", boardView.getId());
    }

    public void deleteBoard(Long boardId) {
        boardViewRepository.deleteById(boardId);

        log.info("Board 삭제 업데이트: boardId={}", boardId);
    }

    public void addView(Long boardId) {
        ViewCount viewCount = viewRepository.findByBoardId_Id(boardId);
        viewCount.setCount(viewCount.getCount() + 1);
    }

    public void addLike(Long boardId) {
        LikeCount likeCount = likeRepository.findByBoardId_Id(boardId);
        likeCount.setCount(likeCount.getCount()+1);
    }
    public void removeLike(Long boardId) {
        LikeCount likeCount = likeRepository.findByBoardId_Id(boardId);
        likeCount.setCount(likeCount.getCount()-1);
    }


    public void addComment(Long boardId) {
        CommentCount commentCount = commentRepository.findByBoardId_Id(boardId);
        commentCount.setCount(commentCount.getCount()+1);
    }
    public void removeComment(Long boardId,int cnt) {
        CommentCount commentCount = commentRepository.findByBoardId_Id(boardId);
        commentCount.setCount(commentCount.getCount()-cnt);
    }

    public List<BoardView> getBoardsPaginated(Pageable pageable) {

        Page<BoardView> boardPage = boardViewRepository.findAll(pageable);

        return boardPage.getContent();
    }
}
