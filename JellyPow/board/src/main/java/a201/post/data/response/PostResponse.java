package a201.post.data.response;

import a201.post.data.entity.*;
import a201.post.enums.Category;
import a201.post.enums.Visibility;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostResponse {
    private Long id;

    private PostUser postUser;

    private String title;

    private String content;

    private Long placeId;

    private BigDecimal starRating;

    private LocalDateTime createdAt;

    private List<String> images;


    public static PostResponse fromEntity(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .placeId(post.getPlaceId())
                .postUser(post.getUserId())
                .starRating(post.getStarRating())
                .createdAt(post.getCreatedAt())
                .build();
    }


}
