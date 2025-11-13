package a201.common.client.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {

    private Long userId;
    private String nickname;
    private String description;
    private String profileImg;
    private String backgroundImg;
    private Integer followerNum;
    private Integer followingNum;
    private Long postCount;
    private Boolean isVisible;
}

