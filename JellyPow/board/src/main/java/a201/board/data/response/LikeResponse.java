package a201.board.data.response;

import a201.board.data.entity.Comment;
import a201.board.data.entity.Like;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LikeResponse {

    Long boardId;

    public static LikeResponse of(Like like) {

        return LikeResponse.builder()
                .boardId(like.getBoard().getId())
                .build();
    }
}
