package a201.common.event;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardDeleteEvent {

    private Long id;
    private Long userId;
}

