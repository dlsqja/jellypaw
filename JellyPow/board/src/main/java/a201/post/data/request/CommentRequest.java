package a201.post.data.request;

import a201.post.data.entity.Comment;
import a201.post.data.entity.Post;
import a201.post.data.entity.PostUser;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequest {

    private Long parent;

    private String content;
}
