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

    // Elasticsearch에서 유저 검색 (기존 메서드 - 호환성 유지)
    // 검색 방식:
    // - match_phrase: 전체 구문이 포함된 것만 검색 (AND 조건) - "조용한문어6" → "조용한문어6" 전체가 포함된 닉네임만
    // - match_phrase_prefix: 구문 검색 + 접두사 검색 - "조용한문어" → "조용한문어6", "조용한문어123" 등
    // - match: 부분 일치 검색 (OR 조건) - "조용한" → "조용한문어", "조용한코끼리" 등
    //@TimeTrace
    public List<UserDocument> searchUsers(String nickname) {
        // bool 쿼리로 여러 필드를 should로 묶어 검색 (가장 정확한 것부터 우선순위)
        // - match_phrase: 전체 구문이 정확히 포함된 것 (가장 높은 가중치)
        // - match_phrase_prefix: 구문 + 접두사 검색
        // - match: 부분 일치 검색 (fallback)
        String queryJson = String.format(
            "{\"bool\": {" +
                "\"should\": [" +
                    "{\"match_phrase\": {" +
                        "\"nickname.ngram\": {" +
                            "\"query\": \"%s\"," +
                            "\"boost\": 3.0" +
                        "}" +
                    "}}," +
                    "{\"match_phrase_prefix\": {" +
                        "\"nickname.edge\": {" +
                            "\"query\": \"%s\"," +
                            "\"boost\": 2.0" +
                        "}" +
                    "}}," +
                    "{\"match\": {" +
                        "\"nickname.nori\": {" +
                            "\"query\": \"%s\"," +
                            "\"operator\": \"and\"," +
                            "\"boost\": 1.0" +
                        "}" +
                    "}}" +
                "]," +
                "\"minimum_should_match\": 1" +
            "}}",
            nickname, nickname, nickname
        );
        
        StringQuery query = new StringQuery(queryJson);
        query.setMaxResults(1000);  // 안전한 크기로 제한 (shard fail 방지)
        SearchHits<UserDocument> searchHits = elasticsearchOperations.search(query, UserDocument.class);
        
        return searchHits.stream()
                .map(SearchHit::getContent)
                .collect(Collectors.toList());
    }

    // Elasticsearch에서 유저 검색 (cursor 기반 - 무한스크롤용, 10개씩 반환)
    // 검색 방식:
    // - match_phrase: 전체 구문이 포함된 것만 검색 (AND 조건)
    // - match_phrase_prefix: 구문 검색 + 접두사 검색
    // - match: 부분 일치 검색 (AND 조건)
    // - cursor: 마지막으로 조회한 userId (null이면 첫 페이지)
    public List<UserDocument> searchUsersWithCursor(String nickname, Long cursor) {
        // 검색 쿼리 부분
        String searchQuery = String.format(
            "{\"bool\": {" +
                "\"should\": [" +
                    "{\"match_phrase\": {" +
                        "\"nickname.ngram\": {" +
                            "\"query\": \"%s\"," +
                            "\"boost\": 3.0" +
                        "}" +
                    "}}," +
                    "{\"match_phrase_prefix\": {" +
                        "\"nickname.edge\": {" +
                            "\"query\": \"%s\"," +
                            "\"boost\": 2.0" +
                        "}" +
                    "}}," +
                    "{\"match\": {" +
                        "\"nickname.nori\": {" +
                            "\"query\": \"%s\"," +
                            "\"operator\": \"and\"," +
                            "\"boost\": 1.0" +
                        "}" +
                    "}}" +
                "]," +
                "\"minimum_should_match\": 1" +
            "}}",
            nickname, nickname, nickname
        );

        // cursor가 있으면 id > cursor 조건 추가
        String queryJson;
        if (cursor != null) {
            queryJson = String.format(
                "{\"bool\": {" +
                    "\"must\": [" +
                        "{\"range\": {" +
                            "\"id\": {" +
                                "\"gt\": %d" +
                            "}" +
                        "}}," +
                        "%s" +
                    "]" +
                "}}",
                cursor, searchQuery
            );
        } else {
            queryJson = searchQuery;
        }
        
        StringQuery query = new StringQuery(queryJson);
        query.setMaxResults(10);  // 10개씩 반환
        SearchHits<UserDocument> searchHits = elasticsearchOperations.search(query, UserDocument.class);
        
        return searchHits.stream()
                .map(SearchHit::getContent)
                .collect(Collectors.toList());
    }

    // MySQL 데이터를 Elasticsearch에 전체 동기화 (배치 처리)
    @Transactional
    public String syncAllUsers() {
        long startTime = System.currentTimeMillis();
        
        // 1. MySQL에서 모든 유저 조회
        List<User> allUsers = userRepository.findAll();
        int totalCount = allUsers.size();
        int batchSize = 1000;  // Elasticsearch bulk 크기 제한을 고려한 배치 크기
        
        System.out.println("=== Elasticsearch 동기화 시작 ===");
        System.out.println("총 " + totalCount + "명의 유저 데이터를 " + batchSize + "개씩 배치 처리합니다.");
        
        int successCount = 0;
        int failCount = 0;
        
        // 2. 배치 단위로 처리
        for (int i = 0; i < totalCount; i += batchSize) {
            int endIndex = Math.min(i + batchSize, totalCount);
            List<User> batchUsers = allUsers.subList(i, endIndex);
            
            try {
                // UserDocument로 변환
                List<UserDocument> batchDocuments = batchUsers.stream()
                        .map(UserDocument::from)
                        .collect(Collectors.toList());
                
                // Elasticsearch에 배치 저장
                userSearchRepository.saveAll(batchDocuments);
                successCount += batchDocuments.size();
                
                // 진행률 출력
                int progress = Math.min(endIndex, totalCount);
                int percentage = (progress * 100) / totalCount;
                System.out.println("진행률: " + percentage + "% (" + progress + "/" + totalCount + ")");
                
            } catch (Exception e) {
                failCount += batchUsers.size();
                System.err.println("배치 저장 실패 (" + i + "~" + (endIndex - 1) + "): " + e.getMessage());
            }
        }
        
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;
        
        String message = String.format(
            "=== Elasticsearch 동기화 완료 ===\n" +
            "총 %d명의 유저 데이터 색인 시도\n" +
            "성공: %d명, 실패: %d명\n" +
            "소요 시간: %dms",
            totalCount, successCount, failCount, duration
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

