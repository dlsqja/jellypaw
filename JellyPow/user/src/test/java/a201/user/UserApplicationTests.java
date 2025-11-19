package a201.user;

import a201.user.domain.auth.entity.Auth;
import a201.user.domain.auth.repository.AuthRepository;
import a201.user.domain.user.entity.User;
import a201.user.domain.user.repository.UserRepository;
import a201.common.event.UserEvent;
import a201.common.util.JsonUtil;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@SpringBootTest
class UserApplicationTests {

    @Autowired
    private AuthRepository authRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    @Autowired
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

            // 4. User Batch Insert (반환된 엔티티에 ID가 설정됨)
            List<User> savedUsers = userRepository.saveAll(userList);
            entityManager.flush();   // DB에 강제 반영하여 ID 생성 확인

            // 5. Kafka 이벤트 발행 (각 유저마다 - 저장된 엔티티 사용)
            for (User user : savedUsers) {
                // ID가 null이면 flush가 제대로 안 된 것이므로 스킵
                if (user.getId() != null) {
                    UserEvent event = new UserEvent(user.getId(), user.getNickname(), user.getProfileImg());
                    kafkaTemplate.send("user-create-topic", JsonUtil.toJsonString(event));
                } else {
                    System.err.println("경고: User ID가 null입니다. nickname: " + user.getNickname());
                }
            }

            entityManager.clear();   // 영속성 컨텍스트 초기화 (메모리 절약)

            // 진행률 출력
            int progress = (batch + 1) * batchSize;
            int percentage = (progress * 100) / totalCount;
            System.out.println("진행률: " + percentage + "% (" + progress + "/" + totalCount + ") - Kafka 이벤트 발행 완료");
        }

        long endTime = System.currentTimeMillis();
        long duration = (endTime - startTime) / 1000; // 초 단위
        System.out.println("=== 총 10만 개 더미 유저 생성 완료 ===");
        System.out.println("소요 시간: " + duration + "초");
    }

    @Test
    @Transactional
    @Commit  // 테스트 후에도 DB에 데이터 유지 (롤백 안함)
    void createKoreanDummyUsersTest() {
        // 기본 10만 개로 테스트
        createKoreanDummyUsers(1000, 1001);
    }

    @Test
    @Transactional
    @Commit  // 테스트 후에도 DB에 데이터 유지 (롤백 안함)
    void createKoreanDummyUsersLargeTest() {
        // 더 많은 데이터 생성용 (예: 50만 개, 100만 개 등)
        // 필요에 따라 totalCount 값을 변경해서 사용하세요
        createKoreanDummyUsers(500000, 0);  // 50만 개
    }

    /**
     * 한글 더미 유저 생성 메서드
     * @param totalCount 생성할 총 유저 수
     */
    private void createKoreanDummyUsers(int totalCount, int startIndex) {
        int batchSize = 1000;     // 1000개씩 batch 처리
        
        // 한글 이름 생성용 데이터
        String[] lastNames = {"김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권", "황", "안", "송", "류", "전",
                              "홍", "문", "양", "손", "배", "백", "허", "유", "남", "심", "노", "정", "하", "곽", "성", "차", "주", "우", "구", "신",
                              "라", "민", "진", "엄", "채", "원", "천", "방", "공", "강", "현", "함", "변", "염", "양", "여", "추", "노", "도", "소"};
        String[] firstNames = {"민준", "서준", "도윤", "예준", "시우", "하준", "주원", "지호", "준서", "건우", 
                               "서연", "서윤", "지우", "서현", "민서", "하은", "윤서", "지유", "채원", "지원",
                               "현우", "준혁", "지훈", "준영", "성민", "민성", "준호", "시윤", "우진", "지원",
                               "수아", "지안", "서아", "하린", "소율", "지원", "채은", "예은", "다은", "나은",
                               "강남", "유성", "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
                               "수원", "성남", "고양", "용인", "부천", "안산", "안양", "남양주", "화성", "평택",
                               "제주", "춘천", "원주", "강릉", "태백", "속초", "삼척", "홍천", "횡성", "영월"};
        String[] adjectives = {"귀여운", "멋진", "착한", "똑똑한", "활발한", "조용한", "친절한", "밝은", "따뜻한", "차분한",
                              "용감한", "부지런한", "긍정적인", "창의적인", "유쾌한", "온화한", "진지한", "유머러스한", "신중한", "적극적인",
                              "사랑스러운", "매력적인", "우아한", "자유로운", "낙천적인", "도전적인", "열정적인", "감성적인", "로맨틱한", "실용적인",
                              "꾸준한", "성실한", "책임감있는", "배려심있는", "이타적인", "협조적인", "독립적인", "자신감있는", "긍정적인", "낙천적인"};
        String[] nouns = {"강아지", "고양이", "햄스터", "토끼", "펭귄", "곰", "사자", "호랑이", "여우", "늑대",
                         "판다", "코알라", "다람쥐", "청설모", "라쿤", "수달", "비버", "고슴도치", "기린", "코끼리",
                         "치타", "표범", "재규어", "퓨마", "스라소니", "스컹크", "오소리", "족제비", "담비", "삵",
                         "수리", "독수리", "올빼미", "부엉이", "까마귀", "까치", "참새", "비둘기", "제비", "갈매기",
                         "고래", "돌고래", "바다사자", "물개", "바다표범", "상어", "가오리", "문어", "오징어", "해파리"};
        
        Random random = new Random();
        
        long startTime = System.currentTimeMillis();
        System.out.println("=== 배치 방식으로 " + totalCount + "개 한글 더미 유저 생성 시작 ===");

        for (int batch = 0; batch < totalCount / batchSize; batch++) {
            List<Auth> authList = new ArrayList<>();
            List<User> userList = new ArrayList<>();

            // 1. Auth 리스트 생성
            for (int i = 0; i < batchSize; i++) {
                int index = startIndex + batch * batchSize + i;
                Auth auth = Auth.builder()
                        .email("korean" + index + "@test.com")
                        .build();
                authList.add(auth);
            }

            // 2. Auth Batch Insert
            authRepository.saveAll(authList);
            entityManager.flush();  // DB에 강제 반영

            // 3. User 리스트 생성 (한글 닉네임과 설명)
            for (int i = 0; i < batchSize; i++) {
                int index = startIndex + batch * batchSize + i;
                
                // 한글 닉네임 생성 (랜덤 조합)
                String nickname;
                if (random.nextBoolean()) {
                    // 성씨 + 이름 조합
                    nickname = lastNames[random.nextInt(lastNames.length)] + 
                              firstNames[random.nextInt(firstNames.length)];
                } else {
                    // 형용사 + 명사 조합
                    nickname = adjectives[random.nextInt(adjectives.length)] + 
                              nouns[random.nextInt(nouns.length)];
                }
                
                // 한글 설명 생성
                String description = String.format("안녕하세요! %s입니다. 반갑습니다! 🐾", nickname);

                User user = User.builder()
                        .auth(authList.get(i))
                        .nickname(nickname + index)  // 중복 방지를 위해 인덱스 추가
                        .description(description)
                        .build();
                userList.add(user);
            }

            // 4. User Batch Insert (반환된 엔티티에 ID가 설정됨)
            List<User> savedUsers = userRepository.saveAll(userList);
            entityManager.flush();   // DB에 강제 반영하여 ID 생성 확인

            // 5. Kafka 이벤트 발행 (각 유저마다 - 저장된 엔티티 사용)
            for (User user : savedUsers) {
                // ID가 null이면 flush가 제대로 안 된 것이므로 스킵
                if (user.getId() != null) {
                    UserEvent event = new UserEvent(user.getId(), user.getNickname(), user.getProfileImg());
                    kafkaTemplate.send("user-create-topic", JsonUtil.toJsonString(event));
                } else {
                    System.err.println("경고: User ID가 null입니다. nickname: " + user.getNickname());
                }
            }

            entityManager.clear();   // 영속성 컨텍스트 초기화 (메모리 절약)

            // 진행률 출력
            int progress = (batch + 1) * batchSize;
            int percentage = (progress * 100) / totalCount;
            System.out.println("진행률: " + percentage + "% (" + progress + "/" + totalCount + ") - 한글 더미 유저 생성 및 Kafka 이벤트 발행 완료");
        }

        long endTime = System.currentTimeMillis();
        long duration = (endTime - startTime) / 1000; // 초 단위
        System.out.println("=== 총 " + totalCount + "개 한글 더미 유저 생성 완료 ===");
        System.out.println("소요 시간: " + duration + "초");
    }

}
