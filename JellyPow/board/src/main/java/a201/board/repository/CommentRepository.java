package a201.board.repository;

import a201.board.data.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {


    List<Comment> findAllByBoardId(Long postId);
    List<Comment> findAllByParentId(Long parentId);

    void deleteAllByParent(Comment parent);
}
