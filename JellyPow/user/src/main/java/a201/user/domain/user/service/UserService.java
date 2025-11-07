package a201.user.domain.user.service;

import a201.user.common.annotation.TimeTrace;
import a201.user.domain.auth.entity.Auth;
import a201.user.domain.auth.repository.AuthRepository;
import a201.user.domain.user.dto.UserRequest;
import a201.common.event.UserEvent;
import a201.user.domain.user.dto.UserSignupResponse;
import a201.user.domain.user.entity.User;
import a201.user.domain.user.repository.UserRepository;
import a201.user.domain.user.service.UserSearchService;
import a201.common.s3.S3Service;
import a201.common.enums.ErrorCode;
import a201.common.exception.CustomException;
import a201.common.util.JsonUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import org.springframework.kafka.core.KafkaTemplate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
	private final AuthRepository authRepository;
	private final S3Service s3Service;
	private final KafkaTemplate<String, String> kafkaTemplate;
	private final UserSearchService userSearchService;

    // 회원가입	
    @Transactional
    public UserSignupResponse signup(UserRequest request) {
       
        //1. 닉네임 중복 체크
        if (userRepository.existsByNickname(request.getNickname())) {
            throw new CustomException(ErrorCode.ALREADY_EXISTS_NICKNAME);
        }

        // 2. Auth가 맞는지 체크하고 없으면 예외 발생
        Auth auth = authRepository.findByEmail(request.getEmail())
		.orElseThrow(() -> new CustomException(ErrorCode.EMAIL_NOT_FOUND));

        // 3. User 생성
        User user = User.builder()
                .auth(auth)
                .nickname(request.getNickname())
                .description(request.getDescription())
                .build();

        User savedUser = userRepository.save(user);

        // 4. Elasticsearch에 자동 동기화
        try {
            userSearchService.syncUser(savedUser.getId());
        } catch (Exception e) {
            // Elasticsearch 동기화 실패해도 회원가입은 성공 처리
            // 로그만 남기고 계속 진행
            System.err.println("Elasticsearch 동기화 실패 (회원가입은 성공): " + e.getMessage());
        }

        // 5. Kafka로 이벤트 발행
        UserEvent event = new UserEvent(savedUser.getId(), savedUser.getNickname(), savedUser.getProfileImg());
        kafkaTemplate.send("user-create-topic", JsonUtil.toJsonString(event));

        // 6. 응답 반환
        return UserSignupResponse.from(savedUser);
    }

    // 프로필 수정
    @Transactional
    public UserSignupResponse updateProfile(Long userId, UserRequest request, MultipartFile profileImg, MultipartFile backgroundImg) {
        // 1. userId로 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 2. 프로필 이미지 처리
        String profileImgUrl = user.getProfileImg();
        if (Boolean.TRUE.equals(request.getDeleteProfileImg())) {
            // 삭제 요청: 기존 S3 파일 삭제
            if (profileImgUrl != null) {
                s3Service.deleteFile(profileImgUrl);
            }
            profileImgUrl = null;
        } else if (profileImg != null && !profileImg.isEmpty()) {
            // 새 파일 업로드: 기존 S3 파일 삭제 후 새 파일 업로드
            if (profileImgUrl != null) {
                s3Service.deleteFile(profileImgUrl);
            }
            profileImgUrl = s3Service.uploadProfileImage(profileImg);
        }
        // 그 외에는 기존 값(user.getProfileImg()) 유지

        // 3. 배경 이미지 처리
        String backgroundImgUrl = user.getBackgroundImg();
        if (Boolean.TRUE.equals(request.getDeleteBackgroundImg())) {
            // 삭제 요청: 기존 S3 파일 삭제
            if (backgroundImgUrl != null) {
                s3Service.deleteFile(backgroundImgUrl);
            }
            backgroundImgUrl = null;
        } else if (backgroundImg != null && !backgroundImg.isEmpty()) {
            // 새 파일 업로드: 기존 S3 파일 삭제 후 새 파일 업로드
            if (backgroundImgUrl != null) {
                s3Service.deleteFile(backgroundImgUrl);
            }
            backgroundImgUrl = s3Service.uploadBackgroundImage(backgroundImg);
        }
        // 그 외에는 기존 값(user.getBackgroundImg()) 유지

        // 4. 프로필 업데이트
        user.updateProfile(
                request.getNickname(),
                request.getDescription(),
                profileImgUrl,
                backgroundImgUrl
        );

        // 5. Elasticsearch에 자동 동기화 (프로필 변경 반영)
        try {
            userSearchService.syncUser(user.getId());
        } catch (Exception e) {
            // Elasticsearch 동기화 실패해도 프로필 수정은 성공 처리
            System.err.println("Elasticsearch 동기화 실패 (프로필 수정은 성공): " + e.getMessage());
        }

		// 6. Kafka로 이벤트 발행
		UserEvent event = new UserEvent(user.getId(), user.getNickname(), user.getProfileImg());
		kafkaTemplate.send("user-update-topic", JsonUtil.toJsonString(event));

        // 7. 응답 반환
        return UserSignupResponse.from(user);
    }
	
	// 유저 검색 (prefix: LIKE "nickname%")
	@TimeTrace  // AOP로 자동으로 실행 시간 측정
	public List<User> searchUsers(String nickname) {
		return userRepository.findByNicknameStartingWith(nickname);
	}

	// 유저 검색 (포함 검색: LIKE "%nickname%")
	@TimeTrace
	public List<User> searchUsersLike(String nickname) {
		return userRepository.findByNicknameContaining(nickname);
	}

    // 닉네임 중복 체크
    public boolean isNicknameDuplicate(String nickname) {
        return userRepository.existsByNickname(nickname);
    }

    // userId로 User 조회
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    // nickname으로 User 조회
    public User getUserByNickname(String nickname) {
        return userRepository.findByNickname(nickname)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

	// authId로 Email 조회
	public String getEmailByAuthId(Long authId) {
		return authRepository.findById(authId)
				.orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND))
				.getEmail();
	}
}

