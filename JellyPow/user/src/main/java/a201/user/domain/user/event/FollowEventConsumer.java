package a201.user.domain.user.event;

import a201.common.event.FollowEvent;
import a201.common.util.JsonUtil;
import a201.user.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class FollowEventConsumer {

    private final UserRepository userRepository;

    @KafkaListener(topics = "follow-topic", groupId = "user-service")
    @Transactional
    public void handleFollowEvent(String message) {
        log.info("Follow 이벤트 수신: {}", message);

        try {
            FollowEvent followEvent = JsonUtil.fromJsonString(message, FollowEvent.class);
            Long fromUserId = followEvent.getFromUserId();
            Long toUserId = followEvent.getToUserId();
            String type = followEvent.getType();

            if ("FOLLOW".equals(type)) {
                // 팔로우: fromUser의 following++, toUser의 follower++
                userRepository.findById(fromUserId).ifPresent(fromUser -> {
                    fromUser.incrementFollowing();
                    log.info("User ID {}의 팔로잉 수 증가: {}", fromUserId, fromUser.getFollowing());
                });

                userRepository.findById(toUserId).ifPresent(toUser -> {
                    toUser.incrementFollower();
                    log.info("User ID {}의 팔로워 수 증가: {}", toUserId, toUser.getFollower());
                });
            } else if ("UNFOLLOW".equals(type)) {
                // 언팔로우: fromUser의 following--, toUser의 follower--
                userRepository.findById(fromUserId).ifPresent(fromUser -> {
                    fromUser.decrementFollowing();
                    log.info("User ID {}의 팔로잉 수 감소: {}", fromUserId, fromUser.getFollowing());
                });

                userRepository.findById(toUserId).ifPresent(toUser -> {
                    toUser.decrementFollower();
                    log.info("User ID {}의 팔로워 수 감소: {}", toUserId, toUser.getFollower());
                });
            } else {
                log.warn("알 수 없는 Follow 이벤트 타입: {}", type);
            }
        } catch (Exception e) {
            log.error("Follow 이벤트 처리 실패: {}", message, e);
        }
    }
}

