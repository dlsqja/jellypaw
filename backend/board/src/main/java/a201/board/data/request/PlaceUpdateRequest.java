package a201.board.data.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class PlaceUpdateRequest {
	private String title;
	private String address;
	private List<String> openingHours;
	private String phoneNumber;
	private String link;
	private Long userId;

	public String getOpeningHoursString(List<String> openingHours) {
		return openingHours != null && !openingHours.isEmpty()
				? String.join(",", openingHours)
				: null;
	}
}
