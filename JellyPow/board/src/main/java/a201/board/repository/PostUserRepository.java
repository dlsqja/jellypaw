package a201.board.repository;

import a201.board.data.entity.PostUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostUserRepository extends JpaRepository<PostUser, Long> {
    PostUser findByUserId(Long userId);
}
