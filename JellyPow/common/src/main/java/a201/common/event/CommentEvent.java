package a201.common.event;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CommentEvent {

    private Long id;

    private int count;

    private String type;
}
