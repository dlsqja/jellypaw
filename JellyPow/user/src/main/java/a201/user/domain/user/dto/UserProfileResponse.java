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
public class UserProfileResponse {

    private Long userId;
    private String nickname;
    private String description;
    private String profileImg;
    private String backgroundImg;
    private Integer followerNum;
    private Integer followingNum;
    private Long postCount;
    private String role;

    public static UserProfileResponse from(User user) {
        return UserProfileResponse.builder()
                .userId(user.getId())
                .nickname(user.getNickname())
                .description(user.getDescription())
                .profileImg(user.getProfileImg())
                .backgroundImg(user.getBackgroundImg())
                .followerNum(user.getFollower())
                .followingNum(user.getFollowing())
                .postCount(user.getPostCount())
                .role(user.getRole())
                .build();
    }
}
