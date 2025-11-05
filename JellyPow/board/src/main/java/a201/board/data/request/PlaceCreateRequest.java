package a201.board.data.request;

import a201.board.data.entity.Place;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Setter
@Getter
public class PlaceCreateRequest {
    private String placeId;
    private String title;
    private String address;
    private String description;
    private String phoneNumber;
    private String link;

    public Place toEntity() {
        return Place.builder()
                .id(placeId)
                .title(this.title)
                .address(this.address)
                .description(this.description)
                .phoneNumber(this.phoneNumber)
                .link(this.link)
                .build();
    }
}
