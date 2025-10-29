package a201.user.domain.user.controller;

import a201.user.domain.user.dto.UserRequest;
import a201.user.domain.user.dto.UserSignupResponse;
import a201.user.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    //회원가입
    @PostMapping("/signup")
    public ResponseEntity<UserSignupResponse> signup(@RequestBody UserRequest request) {
        try {
            UserSignupResponse response = userService.signup(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            throw e;
        }
    }

    //닉네임 중복 체크
    @GetMapping("/check-nickname")
    public ResponseEntity<Boolean> checkNicknameDuplicate(@RequestParam String nickname) {
		boolean isDuplicate = userService.isNicknameDuplicate(nickname);
        return ResponseEntity.ok(isDuplicate);
    }

	//프로필 수정
	@PutMapping(value = "/profile/{user_id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<UserSignupResponse> updateProfile(
			@PathVariable Long user_id,
			@RequestPart("data") UserRequest request,
			@RequestPart(value = "profileImg", required = false) MultipartFile profileImg,
			@RequestPart(value = "backgroundImg", required = false) MultipartFile backgroundImg) {
		try {
			UserSignupResponse response = userService.updateProfile(user_id, request, profileImg, backgroundImg);
			return ResponseEntity.ok(response);
		} catch (IllegalArgumentException e) {
			throw e;
		}
	}
}

