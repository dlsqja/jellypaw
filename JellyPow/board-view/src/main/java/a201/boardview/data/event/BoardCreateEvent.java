package a201.boardview.data.event;


import a201.boardview.data.entity.Board;
import a201.boardview.enums.Category;
import a201.boardview.enums.Visibility;
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
public class BoardCreateEvent {

    private Long id;

    //따로 주입 필요
    private Long userId;

    private Category category;

    private String title;

    private String content;

    private Long placeId;

    private BigDecimal starRating;

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    private LocalDateTime createdAt;

    private Visibility visibility;
    public Board toEntity() {
        return Board.builder()
                .id(id)
                .title(title)
                .content(content)
                .category(category)
                .starRating(starRating)
                .createdAt(createdAt)
                .visibility(visibility)
                .build();
    }
}
