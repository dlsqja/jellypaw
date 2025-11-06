package a201.boardview.data.event;

import a201.board.data.entity.Board;
import a201.board.enums.Category;
import a201.board.enums.Visibility;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    private LocalDateTime createdAt;

    private Visibility visibility;

    public static BoardUpdateEvent fromEntity(Board board) {
        return BoardUpdateEvent.builder()
                .id(board.getId())
                .category(board.getCategory())
                .title(board.getTitle())
                .content(board.getContent())
                .placeId(board.getPlaceId())
                .starRating(board.getStarRating())
                .createdAt(board.getCreatedAt())
                .visibility(board.getVisibility())
                .build();
    }
}
