package a201.user.domain.user.dto;

import a201.user.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSignupResponse {

    private Long userId;
    private String nickname;
    private String description;
    private String profileImg;
    private String backgroundImg;
    private Integer follower;
    private Integer following;
    private String role;
    private String accessToken;  // JWT 액세스 토큰

    public static UserSignupResponse from(User user) {
        return UserSignupResponse.builder()
                .userId(user.getId())
                .nickname(user.getNickname())
                .description(user.getDescription())
                .profileImg(user.getProfileImg())
                .backgroundImg(user.getBackgroundImg())
                .follower(user.getFollower())
                .following(user.getFollowing())
                .role(user.getRole())
                .build();
    }
    
    public static UserSignupResponse from(User user, String accessToken) {
        return UserSignupResponse.builder()
                .userId(user.getId())
                .nickname(user.getNickname())
                .description(user.getDescription())
                .profileImg(user.getProfileImg())
                .backgroundImg(user.getBackgroundImg())
                .follower(user.getFollower())
                .following(user.getFollowing())
                .role(user.getRole())
                .accessToken(accessToken)
                .build();
    }
}

