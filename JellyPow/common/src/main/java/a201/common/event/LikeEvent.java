package a201.common.event;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class LikeEvent {

    private Long id;

    private String type;
}
