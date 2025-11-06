package a201.boardview.repository;

import a201.boardview.data.entity.BoardView;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardViewRepository extends JpaRepository<BoardView, Long> {
}
