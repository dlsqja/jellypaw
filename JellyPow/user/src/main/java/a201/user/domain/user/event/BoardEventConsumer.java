package a201.user.domain.user.event;

import a201.common.event.BoardCreateEvent;
import a201.common.event.BoardDeleteEvent;
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
public class BoardEventConsumer {

    private final UserRepository userRepository;

    @KafkaListener(topics = "board-create-topic", groupId = "user-service")
    @Transactional
    public void handleBoardCreate(String message) {
        log.info("Board 생성 이벤트 수신: {}", message);

        try {
            BoardCreateEvent boardCreateEvent = JsonUtil.fromJsonString(message, BoardCreateEvent.class);
            Long userId = boardCreateEvent.getUserId();

            if (userId != null) {
                userRepository.findById(userId).ifPresent(user -> {
                    user.incrementPostCount();
                    log.info("User ID {}의 게시물 수 증가: {}", userId, user.getPostCount());
                });
            } else {
                log.warn("Board 생성 이벤트에 userId가 없습니다: {}", message);
            }
        } catch (Exception e) {
            log.error("Board 생성 이벤트 처리 실패: {}", message, e);
        }
    }

    @KafkaListener(topics = "board-delete-topic", groupId = "user-service")
    @Transactional
    public void handleBoardDelete(String message) {
        log.info("Board 삭제 이벤트 수신: {}", message);

        try {
            BoardDeleteEvent boardDeleteEvent = JsonUtil.fromJsonString(message, BoardDeleteEvent.class);
            Long userId = boardDeleteEvent.getUserId();

            if (userId != null) {
                userRepository.findById(userId).ifPresent(user -> {
                    user.decrementPostCount();
                    log.info("User ID {}의 게시물 수 감소: {}", userId, user.getPostCount());
                });
            } else {
                log.warn("Board 삭제 이벤트에 userId가 없습니다: {}", message);
            }
        } catch (Exception e) {
            log.error("Board 삭제 이벤트 처리 실패: {}", message, e);
        }
    }
}

