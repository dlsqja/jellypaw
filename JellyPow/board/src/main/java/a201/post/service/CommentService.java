package a201.post.service;

import a201.post.data.entity.Comment;
import a201.post.data.entity.Board;
import a201.post.data.entity.BoardUser;
import a201.post.data.request.CommentRequest;
import a201.post.repository.CommentRepository;
import a201.post.repository.BoardRepository;
import a201.post.repository.PostUserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final BoardRepository boardRepository;
    private final PostUserRepository postUserRepository;

    public void createComment(Long postId, Long userId,CommentRequest commentRequest) {

        Board board = boardRepository.findById(postId).orElseThrow(() -> new EntityNotFoundException("Post Not Found"));
        BoardUser boardUser = postUserRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("Post Not Found"));

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
    }

    public List<Comment> getCommentsByPost(Long postId,Long userId) {
        List<Comment> parents = commentRepository.findAllByPostId(postId);

        return parents;
    }

    public List<Comment> getCommentsByParent(Long parentId,Long userId) {

        List<Comment> childs = commentRepository.findAllByParentId(parentId);

        return childs;
    }

    public void deleteComment(Long commentId,Long userId) {

        Comment comment =  commentRepository.findById(commentId).orElseThrow(() -> new EntityNotFoundException("Comment Not Found"));
        Comment parent = comment.getParent();

        //대댓글 삭제
        if(parent == null) commentRepository.deleteAllByParent(comment);

        commentRepository.delete(comment);

        //TODO::댓글 삭제 이벤트 발생

    }
}

