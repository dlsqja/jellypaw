package a201.user.domain.auth.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "auth")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Auth {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "auth_id")
    private Long authId;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;
}

