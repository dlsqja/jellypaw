package a201.boardview.repository;

import a201.boardview.data.entity.ViewCount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ViewRepository extends JpaRepository<ViewCount, Long> {

    ViewCount findByBoardId_Id(Long boardIdId);
}
