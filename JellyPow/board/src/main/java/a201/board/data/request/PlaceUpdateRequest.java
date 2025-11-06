package a201.board.data.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class PlaceUpdateRequest {
	private String title;
	private String address;
	private String description;
	private String phoneNumber;
	private String link;
	private Long userId;

}
