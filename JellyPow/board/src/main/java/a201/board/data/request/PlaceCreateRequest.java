package a201.board.data.request;

import a201.board.data.entity.Place;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Builder
@Setter
@Getter
public class PlaceCreateRequest {
    private String placeCode;
    private String title;
    private String address;
    private List<String> openingHours;
    private String phoneNumber;
    private String link;

    public Place toEntity() {        
        return Place.builder()
                .code(placeCode)
                .title(this.title)
                .address(this.address)
                .openingHours(getOpeningHoursString(openingHours))  // 변환된 문자열 저장
                .phoneNumber(this.phoneNumber)
                .link(this.link)
                .build();
    }

	public String getOpeningHoursString(List<String> openingHours) {
		return openingHours != null && !openingHours.isEmpty()
				? String.join(",", openingHours)
				: null;
	}
}
