package a201.common.event;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CommentEvent {

    private Long id;  // boardId

    private int count;

    private String type;

    private Long boardAuthorId;  // 게시글 작성자 userId (알림 전송용)
    
    private Long commentAuthorId;  // 댓글 작성자 userId (알림에서 표시용, 선택적)
}
