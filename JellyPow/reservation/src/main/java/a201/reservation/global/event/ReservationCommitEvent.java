package a201.reservation.global.event;

import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;

@Getter
@RequiredArgsConstructor
@Builder
public class ReservationCommitEvent {

    private final Long placeId;
    private final LocalDate date;
    private final Integer time;

}
