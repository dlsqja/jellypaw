package a201.post.repository;

import a201.post.data.entity.PostUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostUserRepository extends JpaRepository<PostUser, Long> {
    PostUser findByUserId(Long userId);
}
