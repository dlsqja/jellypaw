package a201.reservation.event;

import a201.reservation.service.AvailableTimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PlaceEventConsumer {

    private final AvailableTimeService availableTimeService;

    @KafkaListener(topics = "place-available-topic", groupId = "reservation-service")
    public void handlePlaceReservationTimetableCreate(String message) {

    }
}
