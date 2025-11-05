package a201.user.domain.user.service;

import a201.user.common.annotation.TimeTrace;
import a201.user.domain.user.document.UserDocument;
import a201.user.domain.user.entity.User;
import a201.user.domain.user.repository.UserRepository;
import a201.user.domain.user.repository.UserSearchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.StringQuery;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserSearchService {

    private final UserRepository userRepository;
    private final UserSearchRepository userSearchRepository;
    private final ElasticsearchOperations elasticsearchOperations;

    // Elasticsearch에서 유저 검색
    @TimeTrace
    public List<UserDocument> searchUsers(String nickname) {
        // Prefix 쿼리 사용: 앞부분 일치 검색 (LIKE "12%"와 동일)
        // 예: "12" 검색 시 "12", "123", "1234" 등 검색됨 (인덱스 활용 가능)
        String queryJson = String.format(
            "{\"prefix\": {\"nickname\": {\"value\": \"%s\"}}}",
            nickname
        );
        
        StringQuery query = new StringQuery(queryJson);
        query.setMaxResults(1000);  // 안전한 크기로 제한 (shard fail 방지)
        SearchHits<UserDocument> searchHits = elasticsearchOperations.search(query, UserDocument.class);
        
        return searchHits.stream()
                .map(SearchHit::getContent)
                .collect(Collectors.toList());
    }

    // MySQL 데이터를 Elasticsearch에 전체 동기화
    @Transactional
    public String syncAllUsers() {
        long startTime = System.currentTimeMillis();
        
        // 1. MySQL에서 모든 유저 조회
        List<User> allUsers = userRepository.findAll();
        
        // 2. UserDocument로 변환
        List<UserDocument> userDocuments = allUsers.stream()
                .map(UserDocument::from)
                .collect(Collectors.toList());
        
        // 3. Elasticsearch에 일괄 저장
        userSearchRepository.saveAll(userDocuments);
        
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;
        
        String message = String.format(
            "=== Elasticsearch 동기화 완료 ===\n" +
            "총 %d명의 유저 데이터 색인 완료\n" +
            "소요 시간: %dms",
            allUsers.size(), duration
        );
        
        System.out.println(message);
        return message;
    }

    // 특정 유저만 동기화
    @Transactional
    public void syncUser(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            UserDocument userDoc = UserDocument.from(user);
            userSearchRepository.save(userDoc);
            System.out.println("유저 동기화 완료: " + user.getNickname());
        });
    }

    // Elasticsearch 인덱스 전체 삭제
    @Transactional
    public String deleteAllIndex() {
        userSearchRepository.deleteAll();
        return "Elasticsearch 인덱스 전체 삭제 완료";
    }
}

