package a201.user.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequest {

    private String email;
    private String nickname;
    private String description;
    private Boolean deleteProfileImg;      // true면 프로필 이미지 삭제
    private Boolean deleteBackgroundImg;   // true면 배경 이미지 삭제
}

