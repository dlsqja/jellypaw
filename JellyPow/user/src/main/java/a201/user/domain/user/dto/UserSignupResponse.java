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

    private String nickname;
    private String description;
    private String profileImg;
    private String backgroundImg;
    private String role;

    public static UserSignupResponse from(User user) {
        return UserSignupResponse.builder()
                .nickname(user.getNickname())
                .description(user.getDescription())
                .profileImg(user.getProfileImg())
                .backgroundImg(user.getBackgroundImg())
                .role(user.getRole())
                .build();
    }
}

