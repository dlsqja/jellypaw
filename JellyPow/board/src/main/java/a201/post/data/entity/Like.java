package a201.post.data.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "like")
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
    @JoinColumn(name = "post_id", nullable = false)
    private Board board;
}
