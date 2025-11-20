package a201.reservation.domain.reservation.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;



@Getter
@NoArgsConstructor
@Builder
@AllArgsConstructor
@Setter
public class ReservationRequest {

    private LocalDate date;
    private Integer time;
    private String content;

}
