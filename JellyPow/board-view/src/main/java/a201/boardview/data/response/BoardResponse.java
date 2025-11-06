package a201.boardview.data.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardResponse {
    private Long id;

    private BoardUser boardUser;

    private String title;

    private String content;

    private Long placeId;

    private BigDecimal starRating;

    private LocalDateTime createdAt;

    private List<String> images;


    public static BoardResponse fromEntity(Board board) {
        return BoardResponse.builder()
                .id(board.getId())
                .title(board.getTitle())
                .content(board.getContent())
                .placeId(board.getPlaceId())
                .boardUser(board.getUserId())
                .starRating(board.getStarRating())
                .createdAt(board.getCreatedAt())
                .build();
    }


}
