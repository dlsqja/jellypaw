package a201.user.domain.public_api.controller;

import a201.exception.CustomException;
import a201.response.ApiResponse;
import a201.user.domain.user.dto.UserRequest;
import a201.user.domain.user.dto.UserSignupResponse;
import a201.user.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/user")
@RequiredArgsConstructor
public class PublicUserController {

    private final UserService userService;

    // 회원가입
    @PostMapping("/signup")
    public ApiResponse<UserSignupResponse> signup(@RequestBody UserRequest request) {
        try {
            UserSignupResponse response = userService.signup(request);
            return ApiResponse.success(response);
        } catch (CustomException e) {
            return ApiResponse.error(e.getErrorCode());
        }
    }

    // 닉네임 중복 체크
    @GetMapping("/check-nickname")
    public ApiResponse<Boolean> checkNicknameDuplicate(@RequestParam String nickname) {
        boolean isDuplicate = userService.isNicknameDuplicate(nickname);
        return ApiResponse.success(isDuplicate);
    }
}

