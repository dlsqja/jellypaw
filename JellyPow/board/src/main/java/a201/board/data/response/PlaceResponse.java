package a201.board.data.response;

import a201.board.data.entity.Place;
import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;

@Getter
@Builder
public class PlaceResponse {

    private Long id;
    private String title;
    private String address;
    private String description;
    private String phoneNumber;
    private String link;
    private Long userId;
    private BigDecimal starRating;
    private Long postCount;

	public static PlaceResponse from(Place place) {
		return PlaceResponse.builder()
				.id(place.getUserId())
				.title(place.getTitle())
				.address(place.getAddress())
				.description(place.getDescription())
				.phoneNumber(place.getPhoneNumber())
				.link(place.getLink())
				.userId(place.getUserId())
				.starRating(place.getStarRating())
				.postCount(place.getPostCount())
				.build();
	}
}
