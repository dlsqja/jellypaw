package a201.board.data.response;

import a201.board.data.entity.Place;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceSearchResponse {

    private List<PlaceResponse> places;
    private Long nextCursor;  // 다음 요청에 사용할 cursor (null이면 더 이상 데이터 없음)

    public static PlaceSearchResponse from(List<Place> places) {
        // Place 엔티티를 PlaceResponse로 변환
        List<PlaceResponse> placeResponses = places.stream()
                .map(PlaceResponse::from)
                .collect(Collectors.toList());

        // 마지막 항목의 ID를 nextCursor로 설정 (10개 미만이면 null)
        Long nextCursor = null;
        if (places.size() == 10 && !places.isEmpty()) {
            // 10개가 모두 조회되었다면 다음 페이지가 있을 수 있음
            // Place 엔티티의 id를 사용 (PlaceResponse의 id는 userId로 매핑되어 있음)
            nextCursor = places.get(places.size() - 1).getId();
        }

        return PlaceSearchResponse.builder()
                .places(placeResponses)
                .nextCursor(nextCursor)
                .build();
    }
}
