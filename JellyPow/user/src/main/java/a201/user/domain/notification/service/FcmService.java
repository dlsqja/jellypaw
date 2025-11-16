package a201.user.domain.notification.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmService {

    private final FirebaseMessaging firebaseMessaging;

    /**
     * 단일 사용자에게 알림 전송
     * @param fcmToken FCM 토큰
     * @param title 알림 제목
     * @param body 알림 내용
     * @return 전송 성공 여부
     */
    public boolean sendNotification(String fcmToken, String title, String body) {
        if (fcmToken == null || fcmToken.isEmpty()) {
            log.warn("FCM 토큰이 없어 알림을 전송할 수 없습니다.");
            return false;
        }

        try {
            Message message = Message.builder()
                    .setToken(fcmToken)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .build();

            String response = firebaseMessaging.send(message);
            log.info("FCM 알림 전송 성공: token={}, response={}", fcmToken, response);
            return true;
        } catch (FirebaseMessagingException e) {
            log.error("FCM 알림 전송 실패: token={}, error={}", fcmToken, e.getMessage(), e);
            
            // 토큰이 유효하지 않은 경우 (만료, 삭제 등)
            if (e.getErrorCode().equals("invalid-registration-token") || 
                e.getErrorCode().equals("registration-token-not-registered")) {
                log.warn("유효하지 않은 FCM 토큰입니다: {}", fcmToken);
            }
            return false;
        }
    }

    /**
     * 여러 사용자에게 알림 전송 (멀티캐스트)
     * @param fcmTokens FCM 토큰 리스트
     * @param title 알림 제목
     * @param body 알림 내용
     * @return 전송 성공한 토큰 수
     */
    public int sendMulticastNotification(List<String> fcmTokens, String title, String body) {
        if (fcmTokens == null || fcmTokens.isEmpty()) {
            log.warn("FCM 토큰 리스트가 비어있습니다.");
            return 0;
        }

        int successCount = 0;
        for (String token : fcmTokens) {
            if (sendNotification(token, title, body)) {
                successCount++;
            }
        }

        log.info("멀티캐스트 알림 전송 완료: 전체={}, 성공={}", fcmTokens.size(), successCount);
        return successCount;
    }

    /**
     * 데이터 페이로드와 함께 알림 전송
     * @param fcmToken FCM 토큰
     * @param title 알림 제목
     * @param body 알림 내용
     * @param data 추가 데이터 (키-값 쌍)
     * @return 전송 성공 여부
     */
    public boolean sendNotificationWithData(String fcmToken, String title, String body, 
                                           java.util.Map<String, String> data) {
        if (fcmToken == null || fcmToken.isEmpty()) {
            log.warn("FCM 토큰이 없어 알림을 전송할 수 없습니다.");
            return false;
        }

        try {
            Message.Builder messageBuilder = Message.builder()
                    .setToken(fcmToken)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build());

            if (data != null && !data.isEmpty()) {
                messageBuilder.putAllData(data);
            }

            String response = firebaseMessaging.send(messageBuilder.build());
            log.info("FCM 알림 전송 성공 (데이터 포함): token={}, response={}", fcmToken, response);
            return true;
        } catch (FirebaseMessagingException e) {
            log.error("FCM 알림 전송 실패: token={}, error={}", fcmToken, e.getMessage(), e);
            return false;
        }
    }
}

