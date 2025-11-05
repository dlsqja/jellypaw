package a201.reservation.dto;

import a201.reservation.entity.Reservation;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class ReservationResponse {

    private Long userId;
    private Long placeId;
    private LocalDate date;
    private Integer time;
    private String content;

    public static ReservationResponse from(Reservation reservation) {
        return ReservationResponse.builder()
                .userId(reservation.getUserId())
                .placeId(reservation.getPlaceId())
                .date(reservation.getDate())
                .time(reservation.getTime())
                .content(reservation.getContent())
                .build();
    }
}
