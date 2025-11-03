package a201.post.repository;

import a201.post.data.entity.BoardUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BoardUserRepository extends JpaRepository<BoardUser, Long> {
    Optional<BoardUser> findByUserId(Long userId);
    
    boolean existsByUserId(Long userId);

    BoardUser getPostUserByUserId(Long userId);
}
