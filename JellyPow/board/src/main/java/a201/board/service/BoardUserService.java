package a201.board.service;

import a201.board.data.entity.BoardUser;
import a201.board.repository.BoardUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class BoardUserService {

    private final BoardUserRepository boardUserRepository;

    /**
     * 사용자 생성 (User 서비스에서 회원가입 이벤트 수신)
     */
    @Transactional
    public void createUser(Long userId, String nickname, String profileImg) {
        // 중복 체크
        if (boardUserRepository.existsByUserId(userId)) {
            log.warn("이미 존재하는 사용자: userId={}", userId);
            return;
        }

        BoardUser boardUser = BoardUser.builder()
                .userId(userId)
                .nickname(nickname)
                .profileImg(profileImg)
                .build();

        boardUserRepository.save(boardUser);
        log.info("Board 서비스에 사용자 생성: userId={}, nickname={}", userId, nickname);
    }

    /**
     * 사용자 정보 업데이트 (User 서비스에서 프로필 수정 이벤트 수신)
     */
    @Transactional
    public void updateUser(Long userId, String nickname, String profileImg) {
        Optional<BoardUser> userOptional = boardUserRepository.findByUserId(userId);

        if (userOptional.isEmpty()) {
            log.warn("존재하지 않는 사용자 업데이트 시도: userId={}", userId);
            // 존재하지 않으면 생성
            createUser(userId, nickname, profileImg);
            return;
        }

        BoardUser boardUser = userOptional.get();
        boardUser.setNickname(nickname);
        boardUser.setProfileImg(profileImg);

        log.info("Board 서비스 사용자 정보 업데이트: userId={}, nickname={}", userId, nickname);
    }
}

