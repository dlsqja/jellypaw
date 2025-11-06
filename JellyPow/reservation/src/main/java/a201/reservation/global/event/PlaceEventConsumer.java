package a201.reservation.global.event;

import a201.common.event.PlaceEvent;
import a201.common.util.JsonUtil;
import a201.reservation.domain.availableTime.service.AvailableTimeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PlaceEventConsumer {

    private final AvailableTimeService availableTimeService;

    @KafkaListener(topics = "place-available-topic", groupId = "reservation-service")
    public void handlePlaceReservationTimetableCreate(String message) {
        try {
            PlaceEvent event = JsonUtil.fromJsonString(message, PlaceEvent.class);
            availableTimeService.createInitialAvailableTimes(event.getPlaceId());
        } catch (Exception e) {
            log.error("reservation 생성 이벤트 처리 실패: {}", message, e);
        }

    }
}
