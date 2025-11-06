import axios, { type AxiosInstance } from 'axios';
import { API_BASE_URL, ACCESS_TOKEN } from '@env';
import { getAccessToken, clearTokens } from './tokenStorage';
const BASE_URL = API_BASE_URL; // .env의 API_BASE_URL

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async config => {
    // ⚠️ 테스트용: 지금 토큰 하드코딩해서 넣어둠
    const TEST_TOKEN = ACCESS_TOKEN;

    const accessToken = TEST_TOKEN;

    // 실제 사용: 저장소에서 토큰 가져오기
    // const accessToken = await getAccessToken();

    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// ⚠️ 필요해질 때까지 그대로 주석 유지해도 OK
// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401) {
//       // 토큰 정리
//       await clearTokens();
//       // 화면 이동은 네비게이션으로 처리(전역 ref 등)
//       // navigationRef.current?.reset({ index: 0, routes: [{ name: 'Auth' }] });
//     }
//     return Promise.reject(error);
//   },
// );

// apiClient.interceptors.request.use(
//   async config => {
//     // async 추가
//     // AsyncStorage에서 토큰 가져와서 헤더에 추가
//     const accessToken = await getAccessToken(); // localStorage 대신 getAccessToken 사용, await 추가
//     if (accessToken) {
//       config.headers['Authorization'] = `Bearer ${accessToken}`;
//     }
//     return config;
//   },
//   error => Promise.reject(error),
// );

// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401) {
//       // 토큰 만료 시 로그아웃 처리
//       console.log('토큰 만료 - 로그아웃 처리');
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('refreshToken');
//       window.location.href = '/auth';
//     }
//     return Promise.reject(error);
//   },
// );

export default apiClient;
