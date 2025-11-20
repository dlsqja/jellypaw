package a201.user.domain.auth.service;

import a201.common.enums.ErrorCode;
import a201.common.exception.CustomException;
import a201.user.domain.auth.entity.Auth;
import a201.user.domain.auth.repository.AuthRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final AuthRepository authRepository;

    // 이메일로 Auth 생성
    @Transactional
    public Auth createAuth(String email) {
        // 이메일 중복 체크
        if (authRepository.existsByEmail(email)) {
            throw new CustomException(ErrorCode.ALREADY_EXISTS_EMAIL);
        }

        Auth auth = Auth.builder()
                .email(email)
                .build();

        return authRepository.save(auth);
    }

    // 이메일 중복 체크
    public boolean isEmailDuplicate(String email) {
        return authRepository.existsByEmail(email);
    }
	
}

