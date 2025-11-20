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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Reservation", description = "예약 관리 API")
@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final AvailableTimeService availableTimeService;


    @Operation(summary = "예약 생성", description = "특정 장소에 예약을 생성합니다.")
    @PostMapping("/{place_id}")
    public ApiResponse<ReservationResponse> reserve(@PathVariable Long place_id,
                                                    @RequestHeader("X-User-Id") Long userId,
                                                    @RequestBody ReservationRequest reservationRequest) {

        Reservation reservation = reservationService.reserve(place_id, userId, reservationRequest);

        return ApiResponse.success(ReservationResponse.from(reservation));
    }

    @Operation(summary = "사용자 예약 목록 조회", description = "현재 사용자의 예약 목록을 조회합니다.")
    @GetMapping("/users")
    public ApiResponse<ReservationListResponse> getUserReservationList(@RequestHeader("X-User-Id") Long userId) {


        List<Reservation> reservationList = reservationService.getUserReservationList(userId);

        return ApiResponse.success(ReservationListResponse.from(reservationList));
    }

    @Operation(summary = "장소별 예약 목록 조회", description = "특정 장소의 예약 목록을 조회합니다.")
    @GetMapping("/places/{placeId}")
    public ApiResponse<ReservationListResponse> getPlaceReservationList(@RequestHeader("X-User-Id") Long userId,
                                                                        @RequestHeader("X-Role") String role,
                                                                        @PathVariable Long placeId) {

        List<Reservation> reservationList = reservationService.getPlaceReservationList(placeId);

        return ApiResponse.success(ReservationListResponse.from(reservationList));
    }

    @Operation(summary = "예약 가능한 시간 조회", description = "특정 장소의 예약 가능한 시간표를 조회합니다.")
    @GetMapping("/places/{placeId}/timeTable")
    public ApiResponse<AvailableTimeResponse> getAvailableTime(@PathVariable Long placeId,
                                           @RequestParam LocalDate date) {

        AvailableTime availableTime = availableTimeService.getAvailableTimeByPlaceIdAndDate(placeId, date);

        return ApiResponse.success(AvailableTimeResponse.from(availableTime));
    }
}



