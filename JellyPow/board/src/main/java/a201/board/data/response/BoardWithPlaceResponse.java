package a201.board.data.response;

import a201.board.data.entity.BoardUser;
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
public class BoardWithPlaceResponse {

    // BoardSimpleResponse 필드들
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
    private Visibility visibility;
    
    // PlaceResponse 필드들
    private PlaceResponse place;
}

