package a201.boardview.service;

import a201.boardview.data.entity.BoardUser;
import a201.boardview.repository.BoardUserRepository;
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

    @Transactional
    public void createUser(Long userId, String nickname, String profileImg) {
        // 중복 체크
        if (boardUserRepository.existsById(userId)) {
            log.warn("이미 존재하는 사용자: userId={}", userId);
            return;
        }

        BoardUser boardUser = BoardUser.builder()
                .id(userId)
                .nickname(nickname)
                .profileImg(profileImg)
                .build();

        boardUserRepository.save(boardUser);


        log.info("Board 서비스에 사용자 생성: userId={}, nickname={}", userId, nickname);
    }

    @Transactional
    public void updateUser(Long userId, String nickname, String profileImg) {
        Optional<BoardUser> userOptional = boardUserRepository.findById(userId);

        if (userOptional.isEmpty()) {
            log.warn("존재하지 않는 사용자 업데이트 시도: userId={}", userId);
            createUser(userId, nickname, profileImg);
            return;
        }

        BoardUser boardUser = userOptional.get();
        boardUser.setNickname(nickname);
        boardUser.setProfileImg(profileImg);

        log.info("Board 서비스 사용자 정보 업데이트: userId={}, nickname={}", userId, nickname);
    }
}

