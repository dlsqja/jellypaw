package a201.board.data.request;

import a201.board.enums.Category;
import a201.board.enums.Visibility;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostRequest {

    private Category category;

    private String title;

    private String content;

    private Long placeId;

    private BigDecimal starRating;

    @Builder.Default
    private Visibility visibility = Visibility.PUBLIC;

    private List<String> imageUrls;
}
