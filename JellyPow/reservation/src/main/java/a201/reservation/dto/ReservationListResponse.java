package a201.reservation.dto;

import a201.reservation.entity.Reservation;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Builder
// @RequiredArgsConstructor
@Getter
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
