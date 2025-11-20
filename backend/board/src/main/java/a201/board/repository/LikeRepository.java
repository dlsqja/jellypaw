package a201.board.repository;

import a201.board.data.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LikeRepository extends JpaRepository<Like, Long> {

    void deleteByUserId_IdAndBoard_Id(Long userId, Long postId);

    List<Like> findAllByUserId_Id(Long userIdId);
}