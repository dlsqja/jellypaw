import apiClient from '@/lib/axios';
import { debugToRN } from '@/lib/utils';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 토큰에서 userId 뽑는 헬퍼 (기존 로직은 안 건드리고 여기서만 사용)
const getUserIdFromToken = (): string | null => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    debugToRN('REDIS_SAVE_NO_TOKEN', { msg: 'no accessToken in localStorage' });
    return null;
  }

  try {
    const [, payloadBase64] = accessToken.split('.');
    const payloadJson = atob(
      payloadBase64.replace(/-/g, '+').replace(/_/g, '/'),
    );
    const payload = JSON.parse(payloadJson);
    const userId = payload.userId || payload.id || payload.sub;
    debugToRN('REDIS_SAVE_DECODED', { userId });
    return userId ? String(userId) : null;
  } catch (e) {
    debugToRN('REDIS_SAVE_DECODE_ERROR', { error: String(e) });
    return null;
  }
};

export const saveBoardToRedis = async (payload: any): Promise<void> => {
  const userId = getUserIdFromToken();
  if (!userId) {
    debugToRN('REDIS_SAVE_ABORT_NO_USER', {});
    throw new Error('로그인 정보를 확인할 수 없습니다.');
  }

  debugToRN('REDIS_SAVE_START', {
    url: '/redis/save',
    userId,
    boardId: payload?.id || payload?.boardId,
    hasImages: Array.isArray(payload?.images),
  });

  try {
    const res = await apiClient.post<ApiResponse<void>>('/redis/save', payload, {
      headers: { 'X-User-Id': userId },
    });

    debugToRN('REDIS_SAVE_SUCCESS', {
      status: res.status,
      code: res.data?.code,
      message: res.data?.message,
    });
  } catch (err: any) {
    debugToRN('REDIS_SAVE_ERROR', {
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
      url: err?.config?.url,
    });
    throw err;
  }
};