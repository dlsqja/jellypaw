package a201.user.domain.user.dto;

import a201.user.domain.user.entity.User;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDetailResponse {

	private Long userId;
    private String nickname;
    private String description;
    private String profileImg;
    private String backgroundImg;
    private Integer followerNum;
    private Integer followingNum;
    private Long postCount;
    private Boolean isVisible;

    public static UserDetailResponse from(User user) {
        return UserDetailResponse.builder()
                .userId(user.getId())
                .nickname(user.getNickname())
                .description(user.getDescription())
                .profileImg(user.getProfileImg())
                .backgroundImg(user.getBackgroundImg())
                .followerNum(user.getFollower())
                .followingNum(user.getFollowing())
                .postCount(user.getPostCount())
                .build();
    }
}
