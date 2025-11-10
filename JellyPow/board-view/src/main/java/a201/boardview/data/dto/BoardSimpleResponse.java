package a201.boardview.data.dto;

import a201.boardview.data.entity.BoardUser;
import a201.boardview.data.entity.BoardView;
import a201.boardview.data.entity.CommentCount;
import a201.common.enums.Category;
import a201.common.enums.Visibility;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardSimpleResponse {

    private Long id;

    private BoardUser boardUser;

    private String title;

    private String content;

    private Long placeId;

    private BigDecimal starRating;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime createdAt;

    private List<String> images;

    private Integer commentCount;

    private Integer likeCount;

    private Integer viewCount;

    private Category category;

    private String thumbnail;

    private Visibility visibility;



    public static BoardSimpleResponse fromEntity(BoardView boardView) {
        return BoardSimpleResponse.builder()
                .id(boardView.getId())
                .boardUser(boardView.getUserId())
                .title(boardView.getTitle())
                .content(boardView.getContent())
                .placeId(boardView.getPlaceId())
                .boardUser(boardView.getUserId())
                .starRating(boardView.getStarRating())
                .createdAt(boardView.getCreatedAt())
                .category(boardView.getCategory())
                .commentCount(boardView.getComment().getCount())
                .likeCount(boardView.getLikeCount().getCount())
                .viewCount(boardView.getViewCount().getCount())
                .thumbnail(boardView.getThumbnail())
                .visibility(boardView.getVisibility())
                .build();
    }
}
