package a201.user.domain.user.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Document(indexName = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDocument {

    @Id
    private Long id;

    @Field(type = FieldType.Keyword)
    private String nickname;

    @Field(type = FieldType.Text)
    private String description;

    @Field(type = FieldType.Keyword)
    private String profileImg;

    @Field(type = FieldType.Keyword)
    private String backgroundImg;

    @Field(type = FieldType.Integer)
    private Integer follower;

    @Field(type = FieldType.Integer)
    private Integer following;

    // User 엔티티로부터 생성
    public static UserDocument from(a201.user.domain.user.entity.User user) {
        return UserDocument.builder()
                .id(user.getId())
                .nickname(user.getNickname())
                .description(user.getDescription())
                .profileImg(user.getProfileImg())
                .backgroundImg(user.getBackgroundImg())
                .follower(user.getFollower())
                .following(user.getFollowing())
                .build();
    }
}

