package a201.board.data.response;

import a201.board.data.entity.Place;
import a201.common.client.dto.UserResponseDto;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class PlaceResponse {

    private Long id;
    private String title;
    private String address;
    private String openingHours;
    private String phoneNumber;
    private String link;
	private Long userId;
	private UserResponseDto user;
    private BigDecimal starRating;
    private Long postCount;

	public static PlaceResponse from(Place place) {
		return PlaceResponse.builder()
				.id(place.getId())
				.title(place.getTitle())
				.address(place.getAddress())
				.openingHours(place.getOpeningHours())
				.phoneNumber(place.getPhoneNumber())
				.link(place.getLink())
				.userId(place.getUserId())
				.starRating(place.getStarRating())
				.postCount(place.getPostCount())
				.build();
	}
}
