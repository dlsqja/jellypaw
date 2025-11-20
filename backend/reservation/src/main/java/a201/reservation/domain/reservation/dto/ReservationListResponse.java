package a201.reservation.domain.reservation.dto;

import a201.reservation.domain.reservation.entity.Reservation;
import lombok.*;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationListResponse {

    private List<ReservationResponse> reservations;

    public static ReservationListResponse from(List<Reservation> reservationList) {
        List<ReservationResponse> responseList = reservationList.stream()
                .map(ReservationResponse::from).toList();

        return ReservationListResponse.builder()
                .reservations(responseList)
                .build();
    }
}
