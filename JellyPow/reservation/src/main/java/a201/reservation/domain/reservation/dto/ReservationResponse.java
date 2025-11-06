package a201.reservation.domain.reservation.dto;

import a201.reservation.domain.reservation.entity.Reservation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
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
