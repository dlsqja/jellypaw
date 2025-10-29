package a201.board.data.request;

import a201.board.data.entity.Post;
import a201.board.enums.Category;
import a201.board.enums.Visibility;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

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

    private Visibility visibility;

    private List<MultipartFile> newImages;

    public Post toEntity(){

        return Post.builder()
                .title(title)
                .content(content)
                .placeId(placeId)
                .starRating(starRating)
                .visibility(visibility)
                .category(category)
                .build();
    }
}
