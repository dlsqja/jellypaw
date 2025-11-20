package a201.user.domain.user.controller;

import a201.common.response.ApiResponse;
import a201.user.domain.user.document.UserDocument;
import a201.user.domain.user.dto.UserSearchResponse;
import a201.user.domain.user.dto.UserSignupResponse;
import a201.user.domain.user.service.UserSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users/es")  // Elasticsearch 전용 경로로 변경
@RequiredArgsConstructor
public class UserSearchController {

    private final UserSearchService userSearchService;

    // Elasticsearch로 유저 검색 (기존 메서드 - 호환성 유지)
    @GetMapping
    public ApiResponse<List<UserSignupResponse>> searchUsers(@RequestParam String nickname) {
        List<UserDocument> userDocuments = userSearchService.searchUsers(nickname);
        
        List<UserSignupResponse> responses = userDocuments.stream()
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
        
        return ApiResponse.success(responses);
    }

    // Elasticsearch로 유저 검색 (cursor 기반 - 무한스크롤용, 10개씩 반환)
    @GetMapping("/cursor")
    public ApiResponse<UserSearchResponse> searchUsersWithCursor(
            @RequestParam String nickname,
            @RequestParam(required = false) Long cursor) {
        
        List<UserDocument> userDocuments = userSearchService.searchUsersWithCursor(nickname, cursor);
        UserSearchResponse response = UserSearchResponse.from(userDocuments);
        
        return ApiResponse.success(response);
    }

    // MySQL → Elasticsearch 전체 동기화 (관리자용)
    @PostMapping("/sync/all")
    public ApiResponse<String> syncAllUsers() {
        String result = userSearchService.syncAllUsers();
        return ApiResponse.success(result);
    }

    // 특정 유저만 동기화
    @PostMapping("/sync/{userId}")
    public ApiResponse<String> syncUser(@PathVariable Long userId) {
        userSearchService.syncUser(userId);
        return ApiResponse.success("유저 동기화 완료: " + userId);
    }

    // Elasticsearch 인덱스 전체 삭제 (주의!)
    @DeleteMapping("/index")
    public ApiResponse<String> deleteAllIndex() {
        String result = userSearchService.deleteAllIndex();
        return ApiResponse.success(result);
    }
}

