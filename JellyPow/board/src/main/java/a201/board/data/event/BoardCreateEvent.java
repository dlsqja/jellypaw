package a201.board.data.event;

import a201.board.data.entity.Board;
import a201.board.data.entity.BoardUser;
import a201.board.data.entity.Comment;
import a201.board.data.entity.Image;
import a201.board.data.response.BoardResponse;
import a201.board.enums.Category;
import a201.board.enums.Visibility;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardCreateEvent {

    private Long id;

    //따로 주입 필요
    private Long userId;
    private List<String> images;

    private Category category;

    private String title;

    private String content;

    private Long placeId;

    private BigDecimal starRating;

    private LocalDateTime createdAt;

    private Visibility visibility;



    public static BoardCreateEvent fromEntity(Board board) {
        return BoardCreateEvent.builder()
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
