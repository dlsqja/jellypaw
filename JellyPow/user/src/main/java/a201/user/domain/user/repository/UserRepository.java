package a201.user.domain.user.repository;

import a201.user.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Auth로 User 조회
    Optional<User> findByAuth_AuthId(Long authId);

    // nickname으로 User 조회
    Optional<User> findByNickname(String nickname);

    // Auth 존재 여부 확인
    boolean existsByAuth_AuthId(Long authId);

    // nickname 존재 여부 확인
    boolean existsByNickname(String nickname);
}

