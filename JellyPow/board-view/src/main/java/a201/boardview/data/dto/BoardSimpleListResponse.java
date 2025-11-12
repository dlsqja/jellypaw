package a201.boardview.data.dto;

import a201.boardview.data.entity.BoardView;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardSimpleListResponse {

    List<BoardSimpleResponse> boards;

    public static BoardSimpleListResponse fromEntity(List<BoardView> boardViewList) {
        List<BoardSimpleResponse> responseList = boardViewList.stream()
                .map(BoardSimpleResponse::fromEntity).toList();

        return BoardSimpleListResponse.builder()
                .boards(responseList)
                .build();
    }

}
