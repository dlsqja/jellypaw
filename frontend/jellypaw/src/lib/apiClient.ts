import axios, { type AxiosInstance } from 'axios';
import { API_BASE_URL, ACCESS_TOKEN } from '@env';
import { getAccessToken, clearTokens } from './tokenStorage';
const BASE_URL = (API_BASE_URL || '').replace(/\/+$/, '');

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 안전장치: 메서드 기본 CT 제거(혹시 남아있으면 끼어듦)
try {
  // @ts-ignore
  delete apiClient.defaults.headers.common['Content-Type'];
  // @ts-ignore
  delete apiClient.defaults.headers.post?.['Content-Type'];
  // @ts-ignore
  delete apiClient.defaults.headers.put?.['Content-Type'];
  // @ts-ignore
  delete apiClient.defaults.headers.patch?.['Content-Type'];
} catch {}

const isFormData = (data: any) =>
  typeof FormData !== 'undefined' && data instanceof FormData;

// React Native용 base64 디코딩 함수 (atob 대체)
function base64Decode(str: string): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let i = 0;
  str = str.replace(/[^A-Za-z0-9\+\/\=]/g, '');
  while (i < str.length) {
    const enc1 = chars.indexOf(str.charAt(i++));
    const enc2 = chars.indexOf(str.charAt(i++));
    const enc3 = chars.indexOf(str.charAt(i++));
    const enc4 = chars.indexOf(str.charAt(i++));
    const bitmap = (enc1 << 18) | (enc2 << 12) | (enc3 << 6) | enc4;
    if (enc3 !== 64) output += String.fromCharCode((bitmap >> 16) & 255);
    if (enc4 !== 64) output += String.fromCharCode((bitmap >> 8) & 255);
    if (enc4 !== 64) output += String.fromCharCode(bitmap & 255);
  }
  return output;
}

// JWT payload base64url decode → user_id 추출
function getUserIdFromToken(token?: string): string | undefined {
  if (!token) return;
  try {
    const [, payload] = token.split('.');
    // base64url을 일반 base64로 변환 (padding 추가)
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const base64Padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

    // React Native에서 base64 디코딩 (atob 대신)
    const decoded = base64Decode(base64Padded);
    const json = JSON.parse(decoded);
    return json?.user_id || json?.sub || undefined;
  } catch {
    return;
  }
}

apiClient.interceptors.request.use(
  async config => {
    const token = ACCESS_TOKEN;
    config.headers = config.headers ?? {};

    // Authorization
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    // X-User-Id (BE가 요구함) — 토큰에서 추출해서 주입
    const uid = getUserIdFromToken(token);
    if (uid && !(config.headers as any)['X-User-Id']) {
      (config.headers as any)['X-User-Id'] = String(uid);
    }

    // URL 정규화
    if (typeof config.url === 'string') {
      config.url = '/' + config.url.replace(/^\/+/, '');
    }

    // 🔴 핵심: FormData면 CT를 확실히 multipart로 고정
    if (isFormData(config.data)) {
      (config.headers as any)['Content-Type'] = 'multipart/form-data';
      (config.headers as any)['Accept'] = 'application/json';

      // 공통/메서드 헤더에 남아있는 CT 제거(덮어쓰기 방지)
      // @ts-ignore
      if (config.headers?.common) delete config.headers.common['Content-Type'];
      // @ts-ignore
      if (config.headers?.post) delete config.headers.post['Content-Type'];
    }

    // 디버그
    try {
      const h = config.headers ?? {};
      console.log('[api:req]', {
        method: (config.method || 'get').toUpperCase(),
        url: (config.baseURL || '') + (config.url || ''),
        isFormData: isFormData(config.data),
        contentType: (h as any)['Content-Type'],
      });
    } catch {}

    return config;
  },
  e => Promise.reject(e),
);

apiClient.interceptors.response.use(
  res => {
    console.log('[api:res]', {
      url: res.config?.url,
      status: res.status,
      code: res.data?.code,
      message: res.data?.message,
    });
    return res;
  },
  err => {
    console.log('[api:err]', {
      url: err?.config?.url,
      status: err?.response?.status,
      data: err?.response?.data,
    });
    return Promise.reject(err);
  },
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
