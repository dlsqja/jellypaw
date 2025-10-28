package a201.board.repository;

import a201.board.entity.PostUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostUserRepository extends JpaRepository<PostUser, Long> {
}
