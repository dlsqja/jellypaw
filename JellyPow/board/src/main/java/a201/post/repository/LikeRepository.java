package a201.post.repository;

import a201.post.data.entity.Like;
import a201.post.data.entity.PostUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LikeRepository extends JpaRepository<Like, Long> {
    List<Like> findByPostId(Long postId);

    void deleteByUserId_IdAndPost_Id(Long userId, Long postId);

    List<Like> findAllByUserId_Id(Long userIdId);
}