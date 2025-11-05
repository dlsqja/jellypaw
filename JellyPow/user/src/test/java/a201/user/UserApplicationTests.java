package a201.user;

import a201.user.domain.auth.entity.Auth;
import a201.user.domain.auth.repository.AuthRepository;
import a201.user.domain.user.entity.User;
import a201.user.domain.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@SpringBootTest
class UserApplicationTests {

    @Autowired
    private AuthRepository authRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    @MockBean
    private KafkaTemplate<String, String> kafkaTemplate;

    @Test
    void contextLoads() {
    }

    @Test
    @Transactional
    @Commit  // 테스트 후에도 DB에 데이터 유지 (롤백 안함)
    void createDummyUsersTest() {
        int totalCount = 100000;  // 총 10만 개
        int batchSize = 1000;     // 1000개씩 batch 처리
        
        long startTime = System.currentTimeMillis();
        System.out.println("=== 배치 방식으로 10만 개 더미 유저 생성 시작 ===");

        for (int batch = 0; batch < totalCount / batchSize; batch++) {
            List<Auth> authList = new ArrayList<>();
            List<User> userList = new ArrayList<>();

            // 1. Auth 리스트 생성
            for (int i = 0; i < batchSize; i++) {
                int index = batch * batchSize + i;
                Auth auth = Auth.builder()
                        .email("test" + index + "@test.com")
                        .build();
                authList.add(auth);
            }

            // 2. Auth Batch Insert
            authRepository.saveAll(authList);
            entityManager.flush();  // DB에 강제 반영

            // 3. User 리스트 생성 (Auth와 연결)
            for (int i = 0; i < batchSize; i++) {
                int index = batch * batchSize + i;
                User user = User.builder()
                        .auth(authList.get(i))
                        .nickname("test" + index)
                        .description("테스트 유저 " + index + "번입니다.")
                        .build();
                userList.add(user);
            }

            // 4. User Batch Insert
            userRepository.saveAll(userList);
            entityManager.flush();   // DB에 강제 반영
            entityManager.clear();   // 영속성 컨텍스트 초기화 (메모리 절약)

            // 진행률 출력
            int progress = (batch + 1) * batchSize;
            int percentage = (progress * 100) / totalCount;
            System.out.println("진행률: " + percentage + "% (" + progress + "/" + totalCount + ")");
        }

        long endTime = System.currentTimeMillis();
        long duration = (endTime - startTime) / 1000; // 초 단위
        System.out.println("=== 총 10만 개 더미 유저 생성 완료 ===");
        System.out.println("소요 시간: " + duration + "초");
    }

}
