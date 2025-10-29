package a201.reservation.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "reservation")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "place_id", nullable = false)
    private Long placeId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "time", nullable = false)
    private Integer time; //0~47

    @Column(name = "content", nullable = false)
    private String content;

}
