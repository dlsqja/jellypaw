package a201.user.domain.user.dto;

import a201.user.domain.user.document.UserDocument;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSearchResponse {

    private List<UserSignupResponse> users;
    private Long nextCursor;  // 다음 요청에 사용할 cursor (null이면 더 이상 데이터 없음)

    public static UserSearchResponse from(List<UserDocument> userDocuments) {
        // UserDocument를 UserSignupResponse로 변환
        List<UserSignupResponse> userResponses = userDocuments.stream()
                .map(doc -> UserSignupResponse.builder()
                        .userId(doc.getId())
                        .nickname(doc.getNickname())
                        .description(doc.getDescription())
                        .profileImg(doc.getProfileImg())
                        .backgroundImg(doc.getBackgroundImg())
                        .follower(doc.getFollower())
                        .following(doc.getFollowing())
                        .build())
                .collect(Collectors.toList());

        // 마지막 항목의 ID를 nextCursor로 설정 (10개 미만이면 null)
        Long nextCursor = null;
        if (userDocuments.size() == 10 && !userDocuments.isEmpty()) {
            // 10개가 모두 조회되었다면 다음 페이지가 있을 수 있음
            nextCursor = userDocuments.get(userDocuments.size() - 1).getId();
        }

        return UserSearchResponse.builder()
                .users(userResponses)
                .nextCursor(nextCursor)
                .build();
    }
}

