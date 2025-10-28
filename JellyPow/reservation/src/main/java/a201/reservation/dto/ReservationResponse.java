package a201.reservation.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class ReservationResponse {

    private Long user_id;
    private Long place_id;
    private LocalDate date;
    private Integer time;
    private String content;

}
