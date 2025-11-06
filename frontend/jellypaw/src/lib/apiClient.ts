import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import Config from 'react-native-config';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './tokenStorage';

/** 필요한 경우 앱 전역 네비게이터에서 사용 */
let onLogoutCallback: (() => void) | null = null;
export function setOnLogout(cb: () => void) {
  onLogoutCallback = cb;
}

/** 공통 에러 타입 */
export type ApiError = {
  status?: number;
  code?: string | number;
  message: string;
  data?: any;
};

/** 기본 인스턴스 */
const apiClient: AxiosInstance = axios.create({
  baseURL: Config.API_BASE_URL, // .env의 API_BASE_URL
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

/** ===== 요청 인터셉터: Bearer 토큰 주입 ===== */
apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

/** ===== 401 자동 갱신(리프레시) 로직 ===== */
let isRefreshing = false;
let queuedRequests: Array<(token: string | null) => void> = [];

async function processQueue(token: string | null) {
  queuedRequests.forEach((cb) => cb(token));
  queuedRequests = [];
}

/** 실제 리프레시 요청 (API 라우트에 맞게 수정) */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    // 예: POST /auth/refresh { refreshToken }
    const res = await axios.post(
      `${Config.API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' }, timeout: 10_000 },
    );
    const newAccess = res.data?.accessToken as string | undefined;
    const newRefresh = res.data?.refreshToken as string | undefined;
    if (!newAccess) return null;

    await setTokens(newAccess, newRefresh ?? undefined);
    return newAccess;
  } catch {
    return null;
  }
}

function toApiError(err: unknown): ApiError {
  const e = err as AxiosError;
  if (e.response) {
    return {
      status: e.response.status,
      message: (e.response.data as any)?.message ?? '요청 처리 중 오류가 발생했어요.',
      data: e.response.data,
    };
  }
  if (e.request) {
    return { message: '네트워크 연결에 문제가 있어요. 잠시 후 다시 시도해 주세요.' };
  }
  return { message: (e as Error).message ?? '알 수 없는 오류가 발생했어요.' };
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original: AxiosRequestConfig & { _retry?: boolean } = error.config || {};

    // 401이 아니면 그대로 에러 변환
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(toApiError(error));
    }

    // 401 처리
    if (isRefreshing) {
      // 갱신 중이면 큐에 쌓았다가 토큰으로 재시도
      return new Promise((resolve, reject) => {
        queuedRequests.push(async (token) => {
          if (!token) {
            reject(toApiError(error));
            return;
          }
          try {
            original.headers = { ...(original.headers || {}), Authorization: `Bearer ${token}` };
            original._retry = true;
            const resp = await apiClient.request(original);
            resolve(resp);
          } catch (e) {
            reject(toApiError(e));
          }
        });
      });
    }

    // 최초 갱신 시도
    isRefreshing = true;
    original._retry = true;

    const newToken = await refreshAccessToken();
    isRefreshing = false;
    await processQueue(newToken);

    if (!newToken) {
      await clearTokens();
      // 필요시 로그인 화면으로 이동
      onLogoutCallback?.();
      return Promise.reject(toApiError(error));
    }

    // 새 토큰으로 재시도
    try {
      original.headers = { ...(original.headers || {}), Authorization: `Bearer ${newToken}` };
      return await apiClient.request(original);
    } catch (e) {
      return Promise.reject(toApiError(e));
    }
  },
);

export default apiClient;
