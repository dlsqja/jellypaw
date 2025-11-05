package a201.reservation.controller;

import a201.reservation.service.AvailableTimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/test")
public class TestController {

    private final AvailableTimeService availableTimeService;

    @PostMapping("/init/{placeId}")
    public String init(@PathVariable Long placeId) {
        availableTimeService.createInitialAvailableTimes(placeId);
        return "ok";
    }

}
