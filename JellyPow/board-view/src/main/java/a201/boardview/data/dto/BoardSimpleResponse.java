package a201.boardview.data.dto;

import a201.boardview.data.entity.BoardUser;
import a201.boardview.data.entity.BoardView;
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

    private LocalDateTime createdAt;

    private List<String> images;

    public static BoardSimpleResponse fromEntity(BoardView boardView) {
        return BoardSimpleResponse.builder()
                .id(boardView.getId())
                .title(boardView.getTitle())
                .content(boardView.getContent())
                .placeId(boardView.getPlaceId())
                .boardUser(boardView.getUserId())
                .starRating(boardView.getStarRating())
                .createdAt(boardView.getCreatedAt())
                .build();
    }
}
