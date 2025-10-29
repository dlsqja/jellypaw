package a201.board.data.response;

import a201.board.data.entity.Post;
import a201.board.data.entity.PostUser;
import a201.board.enums.Category;
import a201.board.enums.Visibility;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostResponse {

    private Long id;

    private PostUser userId;

    private Category category;

    private String title;

    private String content;

    private Long placeId;

    private Long views = 0L;

    private BigDecimal starRating;

     private LocalDateTime createdAt = LocalDateTime.now();

    private Visibility visibility;
}
