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
import org.springframework.data.elasticsearch.annotations.MultiField;
import org.springframework.data.elasticsearch.annotations.InnerField;
import org.springframework.data.elasticsearch.annotations.Setting;

@Document(indexName = "users")
@Setting(settingPath = "elasticsearch/user-settings.json")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDocument {

    @Id
    private Long id;

    // Multi-field 설정: 
    // - nickname: 기본 텍스트 필드
    // - nickname.ngram: 부분 일치 검색 (포함 검색) - "강남" → "서울강남", "강남역" 모두 매칭
    // - nickname.edge: 접두사 검색 (prefix) - "강남" → "강남역", "강남구"만 매칭
    // - nickname.nori: 한국어 형태소 분석 검색 - "강남역" → "강남", "역"으로 분리하여 검색
    // - nickname.kw: keyword (정확 일치용)
    @MultiField(
        mainField = @Field(type = FieldType.Text),
        otherFields = {
            @InnerField(suffix = "ngram", type = FieldType.Text, analyzer = "ngram_analyzer", searchAnalyzer = "search_analyzer_std"),
            @InnerField(suffix = "edge", type = FieldType.Text, analyzer = "edge_analyzer", searchAnalyzer = "search_analyzer_std"),
            @InnerField(suffix = "nori", type = FieldType.Text, analyzer = "korean_nori", searchAnalyzer = "korean_nori"),
            @InnerField(suffix = "kw", type = FieldType.Keyword, normalizer = "lower_norm")
        }
    )
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

