package a201.boardview.data.response;

import a201.boardview.data.entity.BoardUser;
import a201.boardview.data.entity.BoardView;
import a201.common.enums.Category;
import a201.common.enums.Visibility;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardResponse {

    private Long id;

    private BoardUser userInfo;

    private Category category;

    private String title;

    private String content;

    private Long placeId;

    private BigDecimal starRating;

    private LocalDateTime createdAt;

    private Visibility visibility;

    private Integer commentCount;
    private Integer likeCount;
    private Integer viewCount;

    public static BoardResponse fromEntity(BoardView board) {
        return BoardResponse.builder()
                .id(board.getId())
                .title(board.getTitle())
                .content(board.getContent())
                .placeId(board.getPlaceId())
                .userInfo(board.getUserId())
                .starRating(board.getStarRating())
                .createdAt(board.getCreatedAt())
                .commentCount(board.getCommentCount().getCount())
                .likeCount(board.getLikeCount().getCount())
                .viewCount(board.getViewCount().getCount())
                .build();
    }
}
