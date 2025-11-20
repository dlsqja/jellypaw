package a201.board.data.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequest {

    private Long parent;

    private String content;
}
