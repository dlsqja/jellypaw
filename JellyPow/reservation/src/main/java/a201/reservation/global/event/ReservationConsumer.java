package a201.reservation.global.event;

import a201.common.event.PlaceEvent;
import a201.common.event.ReservationEvent;
import a201.common.util.JsonUtil;
import a201.reservation.domain.reservation.dto.ReservationRequest;
import a201.reservation.domain.reservation.service.ReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReservationConsumer {

    private final ReservationService reservationService;

    @KafkaListener(topics = "reservation-topic", groupId = "reservation-service")
    public void handleReservation(String message) {
        try {
            ReservationEvent event = JsonUtil.fromJsonString(message, ReservationEvent.class);

            ReservationRequest request = ReservationRequest.builder()
                    .userId(event.getUserId())
                    .date(event.getDate())
                    .time(event.getTime())
                    .content(event.getContent())
                    .build();

            reservationService.reserve(event.getPlaceId(), request);
        } catch (Exception e) {
            log.error("reservation 예약 이벤트 처리 실패: {}", message, e);
        }

    }
}
