// src/services/auth/userService.ts
import apiClient from '../../lib/apiClient';
import type { ApiResponse, KakaoLoginResponse } from '../../types/auth';

// 내 정보 조회
export async function getMe() {
  const res = await apiClient.get('/users/profile');
  return res.data; // ApiResponse<UserSignupResponse>
}

// 카카오 인가코드로 로그인 요청 (백엔드 하이브리드)
export async function loginWithKakaoCode(
  code: string,
): Promise<KakaoLoginResponse> {
  const res = await apiClient.post<ApiResponse<KakaoLoginResponse>>(
    '/auth/kakao',
    null,
    { params: { code } }, // @RequestParam String code
  );
  return res.data.data;
}

// 회원가입
export async function signupWithKakao(
  email: string,
  nickname: string,
  description?: string,
) {
  const res = await apiClient.post('/public/signup', {
    email,
    nickname,
    description: description || '',
  });
  return res.data; // ApiResponse<UserSignupResponse>
}

// authId -> email
export async function getEmailByAuthId(authId: number): Promise<string> {
  const res = await apiClient.get(`/public/get-email/${authId}`);
  return res.data.data as string;
}
