package a201.user.domain.user.entity;

import a201.user.domain.auth.entity.Auth;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auth_id", nullable = false, unique = true)
    private Auth auth;

    @Column(name = "nickname", nullable = false, length = 50)
    private String nickname;

    @Column(name = "follower", nullable = false, columnDefinition = "INT NOT NULL DEFAULT 0")
    @Builder.Default
    private Integer follower = 0;

    @Column(name = "following", nullable = false, columnDefinition = "INT NOT NULL DEFAULT 0")
    @Builder.Default
    private Integer following = 0;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "profile_img", length = 255)
    private String profileImg;

    @Column(name = "background_img", length = 255)
    private String backgroundImg;

    @Column(name = "role", nullable = false, columnDefinition = "VARCHAR(30) NOT NULL DEFAULT 'USER'")
    @Builder.Default
    private String role = "USER";

    // 팔로워 증가
    public void incrementFollower() {
        this.follower++;
    }

    // 팔로워 감소
    public void decrementFollower() {
        if (this.follower > 0) {
            this.follower--;
        }
    }

    // 팔로잉 증가
    public void incrementFollowing() {
        this.following++;
    }

    // 팔로잉 감소
    public void decrementFollowing() {
        if (this.following > 0) {
            this.following--;
        }
    }

    // 프로필 정보 업데이트
    public void updateProfile(String nickname, String description, 
                              String profileImg, String backgroundImg) {
        if (nickname != null) {
            this.nickname = nickname;
        }
        if (description != null) {
            this.description = description;
        }
    
		this.profileImg = profileImg;
		this.backgroundImg = backgroundImg;
    }
}

