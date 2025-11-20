package a201.boardview.repository;

import a201.boardview.data.entity.BoardView;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoardViewRepository extends JpaRepository<BoardView, Long> {
    List<BoardView> findAllByUserId_Id(Long userIdId);
    List<BoardView> findAllByUserId_nickname(String nickname);
    List<BoardView> findAllByPlaceId(Long placeId);
}
