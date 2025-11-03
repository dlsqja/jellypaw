package a201.board.data.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "board_user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false, length = 50)
    private String nickname;

    @Column(name = "profile_img")
    private String profileImg;
}
