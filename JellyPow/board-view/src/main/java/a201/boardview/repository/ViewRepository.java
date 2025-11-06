package a201.boardview.repository;

import a201.boardview.data.entity.ViewCount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ViewRepository extends JpaRepository<ViewCount, Long> {
}
