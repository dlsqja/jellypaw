package a201.user.domain.auth.repository;

import a201.user.domain.auth.entity.Auth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthRepository extends JpaRepository<Auth, Long> {

    // email로 Auth 조회
    Optional<Auth> findByEmail(String email);

    // email 존재 여부 확인
    boolean existsByEmail(String email);
}

