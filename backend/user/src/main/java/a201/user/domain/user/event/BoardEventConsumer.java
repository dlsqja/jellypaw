package a201.user.domain.user.event;

import a201.common.event.BoardCreateEvent;
import a201.common.event.BoardDeleteEvent;
import a201.common.event.CommentEvent;
import a201.common.event.LikeEvent;
import a201.common.util.JsonUtil;
import a201.user.domain.notification.service.FcmService;
import a201.user.domain.user.entity.User;
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
    private final FcmService fcmService;

    @KafkaListener(topics = "board-create-topic", groupId = "user-service")
    @Transactional
    public void handleBoardCreate(String message) {
        // log.info("Board 생성 이벤트 수신: {}", message);

        try {
            BoardCreateEvent boardCreateEvent = JsonUtil.fromJsonString(message, BoardCreateEvent.class);
            Long userId = boardCreateEvent.getUserId();

            if (userId != null) {
                userRepository.findById(userId).ifPresent(user -> {
                    user.incrementPostCount();
                    // log.info("User ID {}의 게시물 수 증가: {}", userId, user.getPostCount());
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
        // log.info("Board 삭제 이벤트 수신: {}", message);

        try {
            BoardDeleteEvent boardDeleteEvent = JsonUtil.fromJsonString(message, BoardDeleteEvent.class);
            Long userId = boardDeleteEvent.getUserId();

            if (userId != null) {
                userRepository.findById(userId).ifPresent(user -> {
                    user.decrementPostCount();
                    // log.info("User ID {}의 게시물 수 감소: {}", userId, user.getPostCount());
                });
            } else {
                log.warn("Board 삭제 이벤트에 userId가 없습니다: {}", message);
            }
        } catch (Exception e) {
            log.error("Board 삭제 이벤트 처리 실패: {}", message, e);
        }
    }

    @KafkaListener(topics = "board-like-topic", groupId = "user-service")
    @Transactional
    public void handleLikeEvent(String message) {
        // log.info("좋아요 이벤트 수신: {}", message);

        try {
            LikeEvent likeEvent = JsonUtil.fromJsonString(message, LikeEvent.class);
            String type = likeEvent.getType();

            // 좋아요 추가 시에만 알림 전송
            if ("add".equals(type) && likeEvent.getBoardAuthorId() != null) {
                // 자신의 게시글에 자신이 좋아요를 누른 경우 알림 전송하지 않음
                if (likeEvent.getLikeUserId() != null && 
                    likeEvent.getBoardAuthorId().equals(likeEvent.getLikeUserId())) {
                    return;
                }
                
                User boardAuthor = userRepository.findById(likeEvent.getBoardAuthorId()).orElse(null);
                
                if (boardAuthor != null && boardAuthor.getFcmToken() != null && !boardAuthor.getFcmToken().isEmpty()) {
                    // 좋아요를 누른 사용자 정보 조회
                    String likeUserName = "누군가";
                    if (likeEvent.getLikeUserId() != null) {
                        User likeUser = userRepository.findById(likeEvent.getLikeUserId()).orElse(null);
                        if (likeUser != null) {
                            likeUserName = likeUser.getNickname();
                        }
                    }
                    String title = "JellyPaw🐾";
                    String body = likeEvent.getId() % 2 == 0 ? "멍멍🐕" : "야옹🐈" + "\n" + likeUserName + "님이 좋아요를 눌렀습니다.";
                    fcmService.sendNotification(boardAuthor.getFcmToken(), title, body);
                    // log.info("좋아요 알림 전송: boardId={}, authorId={}, likeUserId={}", likeEvent.getId(), likeEvent.getBoardAuthorId(), likeEvent.getLikeUserId());
                }
            }
        } catch (Exception e) {
            log.error("좋아요 이벤트 처리 실패: {}", message, e);
        }
    }

    @KafkaListener(topics = "board-comment-topic", groupId = "user-service")
    @Transactional
    public void handleCommentEvent(String message) {
        // log.info("댓글 이벤트 수신: {}", message);
		User commentAuthor = null;

        try {
            CommentEvent commentEvent = JsonUtil.fromJsonString(message, CommentEvent.class);
            String type = commentEvent.getType();

            // 댓글 추가 시에만 알림 전송 (자신의 게시글에 자신이 댓글 단 경우 제외)
            if ("add".equals(type) && commentEvent.getBoardAuthorId() != null) {
                // 댓글 작성자가 게시글 작성자와 다른 경우에만 알림 전송
                if (commentEvent.getCommentAuthorId() == null || 
                    !commentEvent.getCommentAuthorId().equals(commentEvent.getBoardAuthorId())) {
                    commentAuthor = userRepository.findById(commentEvent.getCommentAuthorId()).orElse(null);
                    User boardAuthor = userRepository.findById(commentEvent.getBoardAuthorId()).orElse(null);
                    
                    if (boardAuthor != null && boardAuthor.getFcmToken() != null && !boardAuthor.getFcmToken().isEmpty()) {
                        String title = "JellyPaw🐾";
                        String body = "댓글 알림\n" + (commentAuthor != null ? commentAuthor.getNickname() + "님이 댓글을 달았습니다." : "누군가 댓글을 달았습니다.");
                        fcmService.sendNotification(boardAuthor.getFcmToken(), title, body);
                        // log.info("댓글 알림 전송: boardId={}, authorId={}", commentEvent.getId(), commentEvent.getBoardAuthorId());
                    }
                }
            }
        } catch (Exception e) {
            log.error("댓글 이벤트 처리 실패: {}", message, e);
        }
    }
}

