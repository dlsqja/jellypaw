package a201.user.domain.follow.dto;

import a201.user.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowUserResponse {
	private Long userId;
    private String nickname;
    private String profileImg;

    public static FollowUserResponse from(User user) {
        return FollowUserResponse.builder()
                .userId(user.getId())
                .nickname(user.getNickname())
                .profileImg(user.getProfileImg())
                .build();
    }
}

