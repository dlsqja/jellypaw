package a201.reservation.controller;

import a201.reservation.dto.ReservationListResponse;
import a201.reservation.dto.ReservationRequest;
import a201.reservation.dto.ReservationResponse;
import a201.reservation.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
public class ReservationController {
    private final ReservationService reservationService;

    @PostMapping("/{place_id}")
    public ResponseEntity<ReservationResponse> reserve(@PathVariable Long place_id,
                                                       @RequestBody ReservationRequest reservationRequest) {
        return null;
    }

    @GetMapping("/users/{user_id}")
    public ResponseEntity<ReservationListResponse> getUserReservationList(@PathVariable Long user_id) {
        return null;
    }

    @GetMapping("/places/{place_id}")
    public ResponseEntity<ReservationListResponse> getPlaceReservationList(@PathVariable Long place_id) {
        return null;
    }
}
