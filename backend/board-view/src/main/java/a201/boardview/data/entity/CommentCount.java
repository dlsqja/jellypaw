package a201.boardview.data.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "comment_count")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentCount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "board_id", nullable = false)
    private BoardView boardId;

    @Builder.Default
    private Integer count = 0;
}
