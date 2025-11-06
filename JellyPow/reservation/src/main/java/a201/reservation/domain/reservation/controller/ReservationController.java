package a201.reservation.domain.reservation.controller;

import a201.common.response.ApiResponse;
import a201.reservation.domain.availableTime.dto.AvailableTimeResponse;
import a201.reservation.domain.availableTime.entity.AvailableTime;
import a201.reservation.domain.availableTime.service.AvailableTimeService;
import a201.reservation.domain.reservation.dto.ReservationListResponse;
import a201.reservation.domain.reservation.dto.ReservationRequest;
import a201.reservation.domain.reservation.dto.ReservationResponse;
import a201.reservation.domain.reservation.entity.Reservation;
import a201.reservation.domain.reservation.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final AvailableTimeService availableTimeService;


    //Todo : 예약은 api 말고 카프카 이벤트 기반으로 할 예정 (동시성 제어를 위해서)
    @PostMapping("/{place_id}")
    public ApiResponse<ReservationResponse> reserve(@PathVariable Long place_id,
                                                    @RequestBody ReservationRequest reservationRequest) {

        Reservation reservation = reservationService.reserve(place_id, reservationRequest);

        return ApiResponse.success(ReservationResponse.from(reservation));
    }

    @GetMapping("/users")
    public ApiResponse<ReservationListResponse> getUserReservationList(@RequestHeader("X-User-Id") Long userId) {


        List<Reservation> reservationList = reservationService.getUserReservationList(userId);

        return ApiResponse.success(ReservationListResponse.from(reservationList));
    }

    @GetMapping("/places/{placeId}")
    public ApiResponse<ReservationListResponse> getPlaceReservationList(@RequestHeader("X-User-Id") Long userId,
                                                                        @RequestHeader("X-Role") String role,
                                                                        @PathVariable Long placeId) {

        List<Reservation> reservationList = reservationService.getPlaceReservationList(placeId);

        return ApiResponse.success(ReservationListResponse.from(reservationList));
    }

    @GetMapping("/places/{placeId}/timeTable")
    public ApiResponse<AvailableTimeResponse> getAvailableTime(@PathVariable Long placeId,
                                           @RequestParam LocalDate date) {

        AvailableTime availableTime = availableTimeService.getAvailableTimeByPlaceIdAndDate(placeId, date);

        return ApiResponse.success(AvailableTimeResponse.from(availableTime));
    }
}



