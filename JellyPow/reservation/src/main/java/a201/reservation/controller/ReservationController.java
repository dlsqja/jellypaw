package a201.reservation.controller;

import a201.common.response.ApiResponse;
import a201.reservation.dto.ReservationListResponse;
import a201.reservation.dto.ReservationRequest;
import a201.reservation.dto.ReservationResponse;
import a201.reservation.entity.Reservation;
import a201.reservation.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping("/{place_id}")
    public ApiResponse<ReservationResponse> reserve(@PathVariable Long place_id,
                                                    @RequestBody ReservationRequest reservationRequest) {

        Reservation reservation = reservationService.reserve(place_id, reservationRequest);

        return ApiResponse.success(ReservationResponse.from(reservation));
    }

    @GetMapping("/users/{user_id}")
    public ApiResponse<ReservationListResponse> getUserReservationList(@PathVariable Long user_id) {

        List<Reservation> reservationList = reservationService.getUserReservationList(user_id);

        return ApiResponse.success(ReservationListResponse.from(reservationList));
    }

    @GetMapping("/places/{place_id}")
    public ApiResponse<ReservationListResponse> getPlaceReservationList(@PathVariable Long place_id) {

        List<Reservation> reservationList = reservationService.getPlaceReservationList(place_id);

        return ApiResponse.success(ReservationListResponse.from(reservationList));
    }
}
