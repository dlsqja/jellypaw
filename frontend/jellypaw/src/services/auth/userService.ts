// src/services/userService.ts
import api from '../../lib/apiClient';

export async function getMe() {
  const { data } = await api.get('/users/me');
  return data;
}

export async function loginWithKakaoCode(code: string) {
  const { data } = await api.post('/auth/kakao', { code });
  // 서버 응답에 accessToken, refreshToken 담겨온다고 가정
  // setTokens는 로그인 화면/스토어에서 호출하세요.
  return data;
}
