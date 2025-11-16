package a201.common.event;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class LikeEvent {

    private Long id;  // boardId

    private String type;

    private Long boardAuthorId;  // 게시글 작성자 userId (알림 전송용)
}
