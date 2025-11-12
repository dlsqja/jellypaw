package a201.board.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisService {

    private final RedisTemplate<String, String> redisTemplate;

    private static final String KEY_PREFIX = "user:request:";

    /**
     * X-User-Id를 key로 하여 request를 JSON으로 저장
     * @param userId 사용자 ID
     * @param jsonValue JSON 문자열
     * @param ttlSeconds TTL (초 단위, null이면 만료 시간 없음)
     */
    public void saveRequest(Long userId, String jsonValue) {
        String key = KEY_PREFIX + userId;
        try {
			redisTemplate.opsForValue().set(key, jsonValue);
			log.info("Redis 저장 완료: key={} (만료 시간 없음)", key);
        } catch (Exception e) {
            log.error("Redis 저장 실패: key={}", key, e);
            throw new RuntimeException("Redis 저장 실패", e);
        }
    }

    /**
     * X-User-Id를 key로 하여 저장된 request 조회
     * @param userId 사용자 ID
     * @return JSON 문자열 (없으면 null)
     */
    public String getRequest(Long userId) {
        String key = KEY_PREFIX + userId;
        try {
            String value = redisTemplate.opsForValue().get(key);
            if (value != null) {
                log.info("Redis 조회 성공: key={}", key);
            } else {
                log.info("Redis 조회 실패: key={} (데이터 없음)", key);
            }
            return value;
        } catch (Exception e) {
            log.error("Redis 조회 실패: key={}", key, e);
            throw new RuntimeException("Redis 조회 실패", e);
        }
    }

    /**
     * X-User-Id를 key로 하여 저장된 request 삭제
     * @param userId 사용자 ID
     */
    public void deleteRequest(Long userId) {
        String key = KEY_PREFIX + userId;
        try {
            redisTemplate.delete(key);
            log.info("Redis 삭제 완료: key={}", key);
        } catch (Exception e) {
            log.error("Redis 삭제 실패: key={}", key, e);
            throw new RuntimeException("Redis 삭제 실패", e);
        }
    }
}

