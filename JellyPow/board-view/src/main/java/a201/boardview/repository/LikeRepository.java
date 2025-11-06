package a201.boardview.repository;

import a201.boardview.data.entity.LikeCount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LikeRepository extends JpaRepository<LikeCount, Long> {
}
