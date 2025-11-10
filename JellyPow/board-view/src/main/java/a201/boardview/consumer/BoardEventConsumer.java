package a201.boardview.consumer;

import a201.boardview.service.BoardViewService;
import a201.common.event.*;
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
    public void handleDeleteUpdate(String message) {
        log.info("board 삭제 이벤트 수신: {}", message);

        try {
            BoardDeleteEvent boardDeleteEvent = JsonUtil.fromJsonString(message, BoardDeleteEvent.class);
            boardViewService.deleteBoard(boardDeleteEvent.getId());
        } catch (Exception e) {
            log.error("Board 삭제 이벤트 처리 실패: {}", message, e);
        }
    }

    @KafkaListener(topics = "board-like-topic", groupId = "board-view-service")
    public void handleLike(String message) {


        try {
            LikeEvent likeEvent = JsonUtil.fromJsonString(message, LikeEvent.class);
            log.info(likeEvent.toString());
            if(likeEvent.getType().equals("add"))boardViewService.addLike(likeEvent.getId());
            else if(likeEvent.getType().equals("minus")) boardViewService.removeLike(likeEvent.getId());

        } catch (Exception e) {
            log.error("업데이트 이벤트 처리 실패: {}", e);
        }
    }


    @KafkaListener(topics = "board-comment-topic", groupId = "board-view-service")
    public void handleComment(String message) {
        try {

            CommentEvent commentEvent = JsonUtil.fromJsonString(message, CommentEvent.class);
            log.info(commentEvent.toString());
            if(commentEvent.getType().equals("add"))boardViewService.addComment(commentEvent.getId());
            else if(commentEvent.getType().equals("minus")) boardViewService.removeComment(commentEvent.getId(),commentEvent.getCount());

        } catch (Exception e) {
            log.error("업데이트 이벤트 처리 실패: {}", e);
        }
    }

    @KafkaListener(topics = "board-view-topic", groupId = "board-view-service")
    public void handleView(String boardId) {
        try {
            boardViewService.addView(Long.parseLong(boardId));

        } catch (Exception e) {
            log.error("업데이트 이벤트 처리 실패: {}", e);
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
