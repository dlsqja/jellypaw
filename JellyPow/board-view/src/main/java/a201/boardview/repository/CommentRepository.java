package a201.boardview.repository;

import a201.boardview.data.entity.CommentCount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<CommentCount, Long> {
}
