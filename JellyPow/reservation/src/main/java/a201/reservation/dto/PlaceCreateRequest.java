package a201.reservation.dto;

import a201.reservation.entity.Place;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Setter
@Getter
public class PlaceCreateRequest {
    private String title;
    private String address;
    private String description;
    private String phoneNumber;
    private String link;
    private Long userId;

    public Place toEntity() {
        return Place.builder()
                .title(this.title)
                .address(this.address)
                .description(this.description)
                .phoneNumber(this.phoneNumber)
                .link(this.link)
                .userId(this.userId)
                .build();
    }
}
