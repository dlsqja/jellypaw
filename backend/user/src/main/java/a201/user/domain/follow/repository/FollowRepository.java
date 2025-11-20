package a201.user.domain.follow.repository;

import a201.user.domain.follow.entity.Follow;
import a201.user.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {

    // 팔로우 관계 존재 여부 확인
    boolean existsByFromUserAndToUser(User fromUser, User toUser);

    // 팔로우 관계 조회
    Optional<Follow> findByFromUserAndToUser(User fromUser, User toUser);

    // 팔로워 목록 조회 (나를 팔로우하는 사람들 = to가 나)
    List<Follow> findByToUser(User toUser);

    // 팔로잉 목록 조회 (내가 팔로우하는 사람들 = from이 나)
    List<Follow> findByFromUser(User fromUser);

    // 팔로워 수 조회
    long countByToUser(User toUser);

    // 팔로잉 수 조회
    long countByFromUser(User fromUser);
}

