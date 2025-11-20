package a201.user.domain.user.repository;

import a201.user.domain.user.document.UserDocument;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserSearchRepository extends ElasticsearchRepository<UserDocument, Long> {
    
    // nickname으로 검색 (부분 일치)
    // wildcard 쿼리 사용: *test1* 형식으로 검색
    @Query("{\"wildcard\": {\"nickname\": {\"value\": \"*?0*\", \"case_insensitive\": true}}}")
    List<UserDocument> findByNicknameContaining(String nickname);
}

