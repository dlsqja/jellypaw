package a201.reservation.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;



@Getter
@NoArgsConstructor
public class ReservationRequest {

    private Long userId;
    private LocalDate date;
    private Integer time;
    private String content;

}
