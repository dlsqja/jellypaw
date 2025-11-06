package a201.boardview.service;

import a201.boardview.data.entity.*;
import a201.boardview.repository.*;
import a201.common.event.BoardCreateEvent;
import a201.common.event.BoardUpdateEvent;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
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
                .build();

        boardViewRepository.save(boardView);

        CommentCount commentCount = CommentCount.builder().boardId(boardView).build();
        LikeCount likeCount = LikeCount.builder().boardId(boardView).build();
        ViewCount viewCount = ViewCount.builder().boardId(boardView).build();

        viewRepository.save(viewCount);
        likeRepository.save(likeCount);
        commentRepository.save(commentCount);

        log.info("Board 생성: boardId={}", boardView.getId());
    }

    @Transactional
    public void updateBoard(BoardUpdateEvent boardUpdateEvent) {

        BoardView boardView = boardViewRepository.findById(boardUpdateEvent.getId()).orElseThrow(() -> new EntityNotFoundException("Board Not Found"));

        boardView.setCategory(boardUpdateEvent.getCategory());
        boardView.setTitle(boardUpdateEvent.getTitle());
        boardView.setContent(boardUpdateEvent.getContent());
        boardView.setPlaceId(boardUpdateEvent.getPlaceId());
        boardView.setStarRating(boardUpdateEvent.getStarRating());
        boardView.setVisibility(boardUpdateEvent.getVisibility());

        boardViewRepository.save(boardView);

        log.info("Board 업데이트: boardId={}", boardView.getId());
    }

    @Transactional
    public void deleteBoard(Long boardId) {


        boardViewRepository.deleteById(boardId);

        log.info("Board 삭제 업데이트: boardId={}", boardId);
    }
}
