package a201.board.event;

import a201.common.util.JsonUtil;
import a201.common.event.UserEvent;
import a201.board.service.BoardUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserEventConsumer {

    private final BoardUserService boardUserService;
    @KafkaListener(topics = "user-create-topic", groupId = "board-service")
    public void handleUserCreate(String message) {
        log.info("User 생성 이벤트 수신: {}", message);
        
        try {
            UserEvent event = JsonUtil.fromJsonString(message, UserEvent.class);
            boardUserService.createUser(event.getUserId(), event.getNickname(), event.getProfileImg());
        } catch (Exception e) {
            log.error("User 생성 이벤트 처리 실패: {}", message, e);
        }
    }

    @KafkaListener(topics = "user-update-topic", groupId = "board-service")
    public void handleUserUpdate(String message) {
        log.info("User 업데이트 이벤트 수신: {}", message);
        
        try {
            UserEvent event = JsonUtil.fromJsonString(message, UserEvent.class);
            boardUserService.updateUser(event.getUserId(), event.getNickname(), event.getProfileImg());
        } catch (Exception e) {
            log.error("User 업데이트 이벤트 처리 실패: {}", message, e);
        }
    }
}

