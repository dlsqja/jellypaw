package a201.user.domain.user.dto;

import lombok.Getter;

@Getter
public class UserSignupEvent {
	private Long userId;
	private String nickname;
	private String profileImg;

	public UserSignupEvent(Long userId, String nickname, String profileImg) {
		this.userId = userId;
		this.nickname = nickname;
		this.profileImg = profileImg;
	}
}
