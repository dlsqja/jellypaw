package a201.board.data.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "board_like")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private BoardUser userId;

    @ManyToOne
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;
}
