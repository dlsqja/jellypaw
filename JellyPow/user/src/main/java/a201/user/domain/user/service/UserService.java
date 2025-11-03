package a201.user.domain.user.service;

import a201.user.domain.auth.entity.Auth;
import a201.user.domain.auth.repository.AuthRepository;
import a201.user.domain.user.dto.UserRequest;
import a201.user.domain.user.dto.UserSignupEvent;
import a201.user.domain.user.dto.UserSignupResponse;
import a201.user.domain.user.entity.User;
import a201.user.domain.user.repository.UserRepository;
import a201.common.s3.S3Service;
import a201.common.enums.ErrorCode;
import a201.common.exception.CustomException;
import a201.common.util.JsonUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.kafka.core.KafkaTemplate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
	private final AuthRepository authRepository;
	private final S3Service s3Service;
	private final KafkaTemplate<String, String> kafkaTemplate;

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

        // 4. Kafka로 이벤트 발행
        UserSignupEvent event = new UserSignupEvent(savedUser.getUserId(), savedUser.getNickname(), savedUser.getProfileImg());
        kafkaTemplate.send("user-create-topic", JsonUtil.toJsonString(event));

        // 5. 응답 반환
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

		//

		// 5. Kafka로 이벤트 발행
		UserSignupEvent event = new UserSignupEvent(user.getUserId(), user.getNickname(), user.getProfileImg());
		kafkaTemplate.send("user-update-topic", JsonUtil.toJsonString(event));

        // 5. 응답 반환
        return UserSignupResponse.from(user);
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
}

