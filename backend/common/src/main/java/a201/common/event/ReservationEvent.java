package a201.common.event;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationEvent {

    private Long placeId;

    private Long userId;
    private LocalDate date;
    private Integer time;
    private String content;

}
