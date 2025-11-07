package a201.boardview.data.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardSimpleListResponse {

    List<BoardSimpleResponse> boards;

}
