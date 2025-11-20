package a201.common.event;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowEvent {

    private Long fromUserId;
    private Long toUserId;
    private String type; // "FOLLOW" or "UNFOLLOW"
}

