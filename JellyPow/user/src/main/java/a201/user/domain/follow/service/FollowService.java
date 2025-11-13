package a201.user.domain.follow.service;

import a201.common.enums.ErrorCode;
import a201.common.event.FollowEvent;
import a201.common.exception.CustomException;
import a201.common.util.JsonUtil;
import a201.user.domain.follow.dto.FollowUserResponse;
import a201.user.domain.follow.entity.Follow;
import a201.user.domain.follow.repository.FollowRepository;
import a201.user.domain.user.entity.User;
import a201.user.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    // 팔로우 하기
    @Transactional
    public void follow(Long fromUserId, String nickname) {

		// nickname으로 팔로우 받는 사용자 조회
		User toUser = userRepository.findByNickname(nickname)
				.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 1. 자기 자신 팔로우 방지
        if (fromUserId.equals(toUser.getId())) {
            throw new CustomException(ErrorCode.FOLLOW_SELF);
        }

        // 2. 사용자 조회
        User fromUser = userRepository.findById(fromUserId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 3. 이미 팔로우 중인지 확인
        if (followRepository.existsByFromUserAndToUser(fromUser, toUser)) {
            throw new CustomException(ErrorCode.ALREADY_FOLLOWING);
        }

        // 4. 팔로우 생성
        Follow follow = Follow.builder()
                .fromUser(fromUser)
                .toUser(toUser)
                .build();
        followRepository.save(follow);

        // 5. Kafka 이벤트 발행 (동시성 제어를 위해 카운터 업데이트는 이벤트로 처리)
        FollowEvent followEvent = FollowEvent.builder()
                .fromUserId(fromUserId)
                .toUserId(toUser.getId())
                .type("FOLLOW")
                .build();
        kafkaTemplate.send("follow-topic", JsonUtil.toJsonString(followEvent));
    }

    // 언팔로우 하기
    @Transactional
    public void unfollow(Long fromUserId, String nickname) {
        // 1. 사용자 조회
        User fromUser = userRepository.findById(fromUserId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        User toUser = userRepository.findByNickname(nickname)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (fromUser.getId().equals(toUser.getId())) {
            throw new CustomException(ErrorCode.UNFOLLOW_SELF);
        }
        // 2. 팔로우 관계 조회
        Follow follow = followRepository.findByFromUserAndToUser(fromUser, toUser)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOLLOWING));

        // 3. 팔로우 삭제
        followRepository.delete(follow);

        // 4. Kafka 이벤트 발행 (동시성 제어를 위해 카운터 업데이트는 이벤트로 처리)
        FollowEvent followEvent = FollowEvent.builder()
                .fromUserId(fromUserId)
                .toUserId(toUser.getId())
                .type("UNFOLLOW")
                .build();
        kafkaTemplate.send("follow-topic", JsonUtil.toJsonString(followEvent));
    }

    // 팔로워 목록 조회 (나를 팔로우하는 사람들)
    public List<FollowUserResponse> getFollowers(String nickname) {
        User user = userRepository.findByNickname(nickname)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        List<Follow> follows = followRepository.findByToUser(user);
		
        return follows.stream()
                .map(follow -> FollowUserResponse.from(follow.getFromUser()))
                .collect(Collectors.toList());
    }

    // 팔로잉 목록 조회 (내가 팔로우하는 사람들)
    public List<FollowUserResponse> getFollowings(String nickname) {
        User user = userRepository.findByNickname(nickname)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        List<Follow> follows = followRepository.findByFromUser(user);

        return follows.stream()
                .map(follow -> FollowUserResponse.from(follow.getToUser()))
                .collect(Collectors.toList());
    }

	public boolean isFollowed(Long userId, Long targetUserId) {
		User fromUser = userRepository.findById(userId)
				.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
		User toUser = userRepository.findById(targetUserId)
				.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

		Follow follow = followRepository.findByFromUserAndToUser(fromUser, toUser)
				.orElse(null);

		return follow != null ? true : false;
	}
}

