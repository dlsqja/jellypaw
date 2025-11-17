package a201.user.domain.pet.event;

import a201.common.event.AnalysisResultEvent;
import a201.common.util.JsonUtil;
import a201.user.domain.notification.service.FcmService;
import a201.user.domain.pet.service.AnalysisService;
import a201.user.domain.user.entity.User;
import a201.user.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class AnalysisEventConsumer {

    private final AnalysisService analysisService;
    private final UserRepository userRepository;
    private final FcmService fcmService;

    @KafkaListener(topics = "analysis-results-topic", groupId = "user-service")
    @Transactional
    public void handleAnalysisResult(String message) {
        log.info("분석 결과 이벤트 수신: {}", message);

        try {
            AnalysisResultEvent event = JsonUtil.fromJsonString(message, AnalysisResultEvent.class);
            
            if (event.getUserId() == null || event.getPetId() == null) {
                log.warn("분석 결과 이벤트에 userId 또는 petId가 없습니다: {}", message);
                return;
            }

            // 성공 시에만 MongoDB에 저장
            if ("SUCCESS".equals(event.getStatus()) && event.getResult() != null) {
                try {
                    analysisService.saveAnalysis(
                        event.getUserId(),
                        event.getPetId(),
                        event.getResult()
                    );
                    log.info("분석 결과 저장 완료: userId={}, petId={}, requestId={}", 
                        event.getUserId(), event.getPetId(), event.getRequestId());
                } catch (Exception e) {
                    log.error("분석 결과 저장 실패: userId={}, petId={}, requestId={}, error={}", 
                        event.getUserId(), event.getPetId(), event.getRequestId(), e.getMessage(), e);
                    // 저장 실패해도 알림은 전송 시도
                }
            } else {
                log.warn("분석 실패 또는 결과가 없음: status={}, requestId={}, error={}", 
                    event.getStatus(), event.getRequestId(), event.getError());
            }

            // 알림 전송 (성공/실패 모두)
            sendNotification(event);

        } catch (Exception e) {
            log.error("분석 결과 이벤트 처리 실패: {}", message, e);
        }
    }

    private void sendNotification(AnalysisResultEvent event) {
        try {
            User user = userRepository.findById(event.getUserId()).orElse(null);
            
            if (user == null) {
                log.warn("사용자를 찾을 수 없습니다: userId={}", event.getUserId());
                return;
            }

            if (user.getFcmToken() == null || user.getFcmToken().isEmpty()) {
                log.warn("FCM 토큰이 없어 알림을 전송할 수 없습니다: userId={}", event.getUserId());
                return;
            }

            String title;
            String body;

            if ("SUCCESS".equals(event.getStatus())) {
                title = "분석 완료";
                body = "반려동물 건강 분석이 완료되었습니다.";
            } else {
                title = "분석 실패";
                body = event.getError() != null ? event.getError() : "분석 중 오류가 발생했습니다.";
            }

            boolean sent = fcmService.sendNotification(user.getFcmToken(), title, body);
            
            if (sent) {
                log.info("분석 결과 알림 전송 성공: userId={}, petId={}, status={}", 
                    event.getUserId(), event.getPetId(), event.getStatus());
            } else {
                log.warn("분석 결과 알림 전송 실패: userId={}, petId={}", 
                    event.getUserId(), event.getPetId());
            }

        } catch (Exception e) {
            log.error("알림 전송 중 오류 발생: userId={}, error={}", 
                event.getUserId(), e.getMessage(), e);
        }
    }
}

