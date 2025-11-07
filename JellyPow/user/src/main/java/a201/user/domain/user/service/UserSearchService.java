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
    // 한글+영어 혼합 닉네임의 부분 검색 지원
    // 예: "김유성의library" → "유성", "김유성", "김", "lib", "library" 모두 검색 가능
    // 한글은 형태소 분석으로 조사("의") 제외, 영어는 ngram으로 부분 검색
    @TimeTrace
    public List<UserDocument> searchUsers(String nickname) {
        // multi_match 쿼리 사용: nickname(ngram)과 nickname.nori(nori 분석기) 두 필드를 모두 검색
        // - nickname: ngram_analyzer로 영어 부분 검색 (lib, library 등)
        // - nickname.nori: nori 분석기로 한글 형태소 분석, 조사 제외 (김유성, 유성 등)
        // type: "best_fields" - 여러 필드 중 가장 높은 점수를 가진 필드 기준
        // operator: "or" - 검색어의 일부 토큰만 일치해도 검색 가능
        String queryJson = String.format(
            "{\"multi_match\": {" +
                "\"query\": \"%s\"," +
                "\"fields\": [\"nickname^1.0\", \"nickname.nori^1.5\"]," +
                "\"type\": \"best_fields\"," +
                "\"operator\": \"or\"" +
            "}}",
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

