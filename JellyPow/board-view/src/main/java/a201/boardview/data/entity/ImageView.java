package a201.boardview.data.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "image_view")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImageView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "board_id", nullable = false)
    private BoardView boardView;

    @Column(name = "image_link", nullable = false)
    private String imageLink;
}
