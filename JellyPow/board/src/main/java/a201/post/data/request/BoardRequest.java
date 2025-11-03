package a201.post.data.request;

import a201.post.data.entity.Board;
import a201.post.enums.Category;
import a201.post.enums.Visibility;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BoardRequest {

    private Category category;

    private String title;

    private String content;

    private Long placeId;

    private BigDecimal starRating;

    private Visibility visibility;

    private List<MultipartFile> newImages;

    public Board toEntity(){

        return Board.builder()
                .title(title)
                .content(content)
                .placeId(placeId)
                .starRating(starRating)
                .visibility(visibility)
                .category(category)
                .build();
    }
}
