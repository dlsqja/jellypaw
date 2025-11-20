package a201.common.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserEvent {
	private Long userId;
	private String nickname;
	private String profileImg;
}

