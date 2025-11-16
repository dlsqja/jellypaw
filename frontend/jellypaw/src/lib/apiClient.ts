// src/lib/apiClient.ts
import axios, { type AxiosInstance } from 'axios';
import { API_BASE_URL } from '@env';
import { getAccessToken, getRefreshToken, setTokens, clearTokens} from './tokenStorage';

let isRefreshing = false;
let pendingQueue: Array<(t: string|null)=>void> = [];
// API BASE: 끝 / 제거 (API용)
const BASE_URL = (API_BASE_URL || '').replace(/\/+$/, '');

// API 클라이언트 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// 메서드 기본 CT 제거 (axios 기본값 충돌 방지)
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

// FormData 체크 (절대 건들지 말고, 헤더만 세팅)
const isFormData = (data: any) =>
  typeof FormData !== 'undefined' && data instanceof FormData;

// base64 디코딩 (JWT payload 용)
function base64Decode(str: string): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let i = 0;
  str = str.replace(/[^A-Za-z0-9+/=]/g, '');
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

// JWT에서 user_id 추출 → X-User-Id 주입
function getUserIdFromToken(token?: string | null): string | undefined {
  if (!token) return;
  try {
    const [, payload] = token.split('.');
    if (!payload) return;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = base64Decode(padded);
    const json = JSON.parse(decoded);

    const cand =
      json.user_id ??
      json.userId ??      
      json.uid ??
      json.sub ??
      json.id ??
      json.user ??
      json.userID;     

    if (cand == null) return;
    return String(cand);
  } catch {
    return;
  }
}

// ───────────────────────────────────
// 요청 인터셉터
// ───────────────────────────────────
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    config.headers = config.headers ?? {};

    // Authorization 헤더 추가
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    // X-User-Id (백엔드에서 필요)
    const uid = getUserIdFromToken(token);
    if (uid && !(config.headers as any)['X-User-Id']) {
      (config.headers as any)['X-User-Id'] = uid;
    }

    // URL 앞에 / 강제 (baseURL 뒤에 붙도록)
    if (typeof config.url === 'string') {
      config.url = '/' + config.url.replace(/^\/+/, '');
    }

    // FormData면 body는 그대로 두고, 헤더만 multipart로
    if (isFormData(config.data)) {
      (config.headers as any)['Content-Type'] = 'multipart/form-data';
      (config.headers as any).Accept = 'application/json';
    }

    // 디버그
    try {
      const h = config.headers ?? {};
      // 디버그 로그 출력
      console.log('[api:req]', {
        // baseURL: config.baseURL,
        // token: token,
        method: (config.method || 'get').toUpperCase(),
        url: (config.baseURL || '') + (config.url || ''),
        isFormData: isFormData(config.data),
        contentType: (h as any)['Content-Type'],
      });
    } catch {}

    // 요청 설정 반환
    return config;
  },
  (e) => Promise.reject(e),
);

// ───────────────────────────────────
// 응답 인터셉터
// ───────────────────────────────────
apiClient.interceptors.response.use(
  // 성공 응답 처리
  (res) => {
    console.log('[api:res]', {
      url: res.config?.url,
      status: res.status,
      code: res.data?.code,
      message: res.data?.message,
    });
    return res;
  },
  async (err) => {
    console.log('[api:err]', {
      url: err?.config?.url,
      status: err?.response?.status,
      data: err?.response?.data,
    });

    const original = err?.config;
    const status = err?.response?.status;

    // 1) 401이 아니면 그대로 실패
    if (status !== 401 || !original || original._retry) {
      return Promise.reject(err);
    }

    // 2) refresh 토큰 있으면 한 번만 시도
    const refresh = await getRefreshToken();
    if (!refresh) {
      await clearTokens();
      return Promise.reject(err);
    }

    original._retry = true;

    // 동시 401 방지: refresh 중이면 큐에 대기
    if (isRefreshing) {
      const newToken = await new Promise<string|null>((resolve) => {
        pendingQueue.push(resolve);
      });
      if (newToken) original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    }

    try {
      isRefreshing = true;
      const resp = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken: refresh }, { withCredentials: true });
      const newAccess = resp?.data?.accessToken ?? resp?.data?.data?.accessToken;
      const newRefresh = resp?.data?.refreshToken ?? resp?.data?.data?.refreshToken ?? refresh;

      if (!newAccess) {
        throw new Error('no access from refresh');
      }
      await setTokens(newAccess, newRefresh);

      // 대기중 요청 깨우기
      pendingQueue.forEach((r) => r(newAccess));
      pendingQueue = [];
      isRefreshing = false;

      // 원요청 재시도
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newAccess}`;
      return apiClient(original);
    } catch (e) {
      // 실패: 로그인 상태 제거
      await clearTokens();
      pendingQueue.forEach((r) => r(null));
      pendingQueue = [];
      isRefreshing = false;
      return Promise.reject(e);
    }
 },
);

export default apiClient;

export { getUserIdFromToken }