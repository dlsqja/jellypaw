package a201.board.service;

import a201.board.data.entity.Like;
import a201.board.data.entity.Board;
import a201.board.data.entity.BoardUser;
import a201.board.repository.LikeRepository;
import a201.board.repository.BoardRepository;
import a201.board.repository.BoardUserRepository;
import a201.common.event.LikeEvent;
import a201.common.util.JsonUtil;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class LikeService {

    private final BoardRepository boardRepository;
    private final BoardUserRepository boardUserRepository;
    private final LikeRepository likeRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    public void addLike(Long postId,Long userId) {
        Board board = boardRepository.getBoardById(postId);
        BoardUser boardUser = boardUserRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User Not Found"));

        Like like = Like.builder()
                .board(board)
                .userId(boardUser)
                .build();

        likeRepository.save(like);
        //TODO::좋아요 이벤트 발생
        LikeEvent likeEvent = LikeEvent.builder()
                .id(postId)
                .type("add")
                .boardAuthorId(board.getUserId().getId())  // 게시글 작성자 ID 추가
                .likeUserId(userId)  // 좋아요를 누른 사용자 ID 추가
                .build();

        kafkaTemplate.send("board-like-topic", JsonUtil.toJsonString(likeEvent));

    }

    public void removeLike(Long postId,Long userId) {

        Board board = boardRepository.getBoardById(postId);
        likeRepository.deleteByUserId_IdAndBoard_Id(userId,postId);

        //TODO::삭제 이벤트 발생
        LikeEvent likeEvent = LikeEvent.builder()
                .id(postId)
                .type("minus")
                .boardAuthorId(board.getUserId().getId())  // 게시글 작성자 ID 추가
                .build();

        kafkaTemplate.send("board-like-topic", JsonUtil.toJsonString(likeEvent));

    }

    public List<Like> getLikesByMe(Long userId) {
        
        return likeRepository.findAllByUserId_Id(userId);
    }
}

