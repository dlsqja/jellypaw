package a201.post.repository;

import a201.post.data.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LikeRepository extends JpaRepository<Like, Long> {
    List<Like> findByPostId(Long postId);
    List<Like> findByUserId(Long userId);
}