package a201.board.service;

import a201.board.data.entity.Comment;
import a201.board.data.entity.Board;
import a201.board.data.entity.BoardUser;
import a201.board.data.request.CommentRequest;
import a201.board.data.response.CommentResponse;
import a201.board.repository.CommentRepository;
import a201.board.repository.BoardRepository;
import a201.board.repository.BoardUserRepository;
import a201.common.event.CommentEvent;
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
public class CommentService {

    private final CommentRepository commentRepository;
    private final BoardRepository boardRepository;
    private final BoardUserRepository boardUserRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    public void createComment(Long postId, Long userId,CommentRequest commentRequest) {

        Board board = boardRepository.findById(postId).orElseThrow(() -> new EntityNotFoundException("Post Not Found"));
        BoardUser boardUser = boardUserRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User Not Found"));

        Comment comment = Comment.builder()
                .board(board)
                .content(commentRequest.getContent())
                .userId(boardUser)
                .build();

        if(commentRequest.getParent() != null){
            Comment parentComment = commentRepository.findById(commentRequest.getParent()).orElseThrow(() -> new EntityNotFoundException("Post Not Found"));
            comment.setParent(parentComment);
        }
        commentRepository.save(comment);


        //TODO::댓글 추가 이벤트 발생
        CommentEvent commentEvent = CommentEvent.builder()
                .id(postId)
                .type("add")
                .build();
        kafkaTemplate.send("board-comment-topic", JsonUtil.toJsonString(commentEvent));
    }

    public List<CommentResponse> getCommentsByPost(Long postId,Long userId) {
        List<Comment> comments = commentRepository.findAllByBoard_IdAndParentIsNull(postId);


        return comments.stream()
                .map(CommentResponse::of)
                .toList();
    }

    public void deleteComment(Long commentId,Long userId,Long boardId) {

        Comment comment =  commentRepository.findById(commentId).orElseThrow(() -> new EntityNotFoundException("Comment Not Found"));

        int cnt=1;
        //대댓글 삭제
        cnt += comment.getChildren().size();
        commentRepository.delete(comment);

        //TODO::댓글 삭제 이벤트 발생
        CommentEvent commentEvent = CommentEvent.builder()
                .id(boardId)
                .count(cnt)
                .type("minus")
                .build();
        kafkaTemplate.send("board-comment-topic", JsonUtil.toJsonString(commentEvent));
    }
}

