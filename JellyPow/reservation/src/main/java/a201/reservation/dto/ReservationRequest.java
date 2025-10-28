package a201.reservation.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
@Setter
@Getter
public class ReservationRequest {

    private Long user_id;
    private Long place_id;
    private LocalDate date;
    private Integer time;
    private String content;

}
