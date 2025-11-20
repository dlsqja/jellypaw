package a201.board.repository;

import a201.board.data.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardRepository extends JpaRepository<Board, Long> {

    Board getBoardById(Long id);
}
