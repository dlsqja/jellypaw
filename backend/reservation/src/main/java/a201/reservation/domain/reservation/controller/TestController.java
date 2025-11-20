package a201.reservation.domain.reservation.controller;

import a201.reservation.domain.availableTime.service.AvailableTimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/reservations/test")
public class TestController {

    private final AvailableTimeService availableTimeService;

    @PostMapping("/init/{placeId}")
    public String init(@PathVariable Long placeId) {
        availableTimeService.createInitialAvailableTimes(placeId);
        return "ok";
    }

    @PostMapping("/slide")
    public String slide() {
        availableTimeService.slideOneDay();
        return "ok";
    }
}
