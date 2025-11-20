package a201.common.event;

import a201.common.enums.Category;
import a201.common.enums.Visibility;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardUpdateEvent {

    private Long id;

    private Category category;

    private String title;

    private String content;

    private Long placeId;

    private BigDecimal starRating;

    private Visibility visibility;

    private List<String> imageUrls;
}
