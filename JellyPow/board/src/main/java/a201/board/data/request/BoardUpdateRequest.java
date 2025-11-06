package a201.board.data.request;

import a201.board.enums.Category;
import a201.board.enums.Visibility;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BoardUpdateRequest {
    private Category category;

    private String title;

    private String content;

    private Long placeId;

    private BigDecimal starRating;

    private Visibility visibility;

    private List<MultipartFile> newImages;

    private List<String> removeImages; // 삭제할 이미지 URL
}
