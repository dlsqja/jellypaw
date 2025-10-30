package a201.post.repository;

import a201.post.data.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {


    List<Comment> findAllByPostId(Long postId);
    List<Comment> findAllByParentId(Long parentId);

    void deleteAllByParent(Comment parent);
}
