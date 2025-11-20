package a201.boardview.data.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
    private Long id;

    @Column(nullable = false, length = 50)
    private String nickname;

    @Column(name = "profile_img")
    private String profileImg;
}

