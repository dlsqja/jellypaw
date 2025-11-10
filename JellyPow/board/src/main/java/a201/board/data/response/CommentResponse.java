package a201.board.data.response;

import a201.board.data.entity.Board;
import a201.board.data.entity.BoardUser;
import a201.board.data.entity.Comment;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CommentResponse {

    private Long id;
    private BoardUser userId;
    private Long parent;
    private String content;
    private LocalDateTime createdAt;

    public static CommentResponse of(Comment comment) {
        CommentResponse commentResponse =  CommentResponse.builder()
                .id(comment.getId())
                .userId(comment.getUserId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();

        if(comment.getParent()!=null) commentResponse.parent = comment.getParent().getId();

        return commentResponse;
    }

}
