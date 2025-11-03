package a201.post.repository;

import a201.post.data.entity.BoardUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostUserRepository extends JpaRepository<BoardUser, Long> {
    BoardUser findByUserId(Long userId);

    BoardUser getPostUserByUserId(Long userId);
}
