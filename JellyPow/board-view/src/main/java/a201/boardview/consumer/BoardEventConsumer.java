package a201.boardview.consumer;

import a201.boardview.service.BoardUserService;
import a201.boardview.service.BoardViewService;
import a201.common.event.BoardCreateEvent;
import a201.common.event.BoardUpdateEvent;
import a201.common.event.UserEvent;
import a201.common.util.JsonUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BoardEventConsumer {

    private final BoardViewService boardViewService;

    @KafkaListener(topics = "board-create-topic", groupId = "board-view-service")
    public void handleBoardCreate(String message) {
        log.info("board 생성 이벤트 수신: {}", message);

        try {
            BoardCreateEvent boardCreateEvent = JsonUtil.fromJsonString(message, BoardCreateEvent.class);
            boardViewService.createBoard(boardCreateEvent);
        } catch (Exception e) {
            log.error("User 생성 이벤트 처리 실패: {}", message, e);
        }
    }

    @KafkaListener(topics = "board-update-topic", groupId = "board-view-service")
    public void handleBoardUpdate(String message) {
        log.info("board 업데이트 이벤트 수신: {}", message);

        try {
            BoardUpdateEvent boardUpdateEvent = JsonUtil.fromJsonString(message, BoardUpdateEvent.class);
            boardViewService.updateBoard(boardUpdateEvent);
        } catch (Exception e) {
            log.error("User 업데이트 이벤트 처리 실패: {}", message, e);
        }
    }

    @KafkaListener(topics = "board-delete-topic", groupId = "board-view-service")
    public void handleDeleteUpdate(String boardId) {
        log.info("board 삭제 이벤트 수신: {}", boardId);

        try {
            boardViewService.deleteBoard(Long.parseLong(boardId));
        } catch (Exception e) {
            log.error("User 업데이트 이벤트 처리 실패: {}", boardId, e);
        }
    }

    /*
    @KafkaListener(topics = "board-view-topic", groupId = "board-view-service")
    public void handleUserUpdate(String message) {
        log.info("User 업데이트 이벤트 수신: {}", message);

        try {
            UserEvent event = JsonUtil.fromJsonString(message, UserEvent.class);
            boardUserService.updateUser(event.getUserId(), event.getNickname(), event.getProfileImg());
        } catch (Exception e) {
            log.error("User 업데이트 이벤트 처리 실패: {}", message, e);
        }
    }
     */
}
