// services/api/redis.ts
import apiClient from '@/lib/axios';
import { debugToRN } from '@/lib/utils';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 토큰에서 userId 뽑는 헬퍼 (기존 로직 안 건드리고 여기서만 사용)
const getUserIdFromToken = (): string | null => {
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    debugToRN('REDIS_SAVE_NO_TOKEN', {
      msg: 'no accessToken in localStorage',
    });
    return null;
  }

  try {
    debugToRN('REDIS_SAVE_TOKEN_FOUND', {
      len: accessToken.length,
      head: accessToken.slice(0, 20),
    });

    const parts = accessToken.split('.');
    if (parts.length !== 3) {
      debugToRN('REDIS_SAVE_BAD_JWT_FORMAT', {
        parts: parts.length,
      });
      return null;
    }

    const payloadBase64 = parts[1];
    // padding & web-safe 처리
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

    const payloadJson = atob(padded);
    const payload = JSON.parse(payloadJson || '{}');

    //  실제 payload 구조 확인용 (RN 콘솔 + 웹 콘솔 둘 다 찍힘)
    debugToRN('REDIS_SAVE_PAYLOAD', {
      keys: Object.keys(payload || {}),
      payload,
    });

    
    const userId =
      payload.user_id || // snake_case
      payload.userId || // camelCase
      payload.uid || // 혹시 이런 케이스면
      payload.id || // 그냥 id
      payload.sub; // sub에 박아두는 경우

    if (!userId) {
      debugToRN('REDIS_SAVE_ABORT_NO_USER', {
        msg: 'no user id field in payload',
      });
      return null;
    }

    debugToRN('REDIS_SAVE_RESOLVED_USER_ID', { userId: String(userId) });
    return String(userId);
  } catch (e) {
    debugToRN('REDIS_SAVE_DECODE_ERROR', {
      error: String(e),
    });
    return null;
  }
};

export const saveBoardToRedis = async (payload: any): Promise<void> => {
  const userId = getUserIdFromToken();
  if (!userId) {
    // getUserIdFromToken 안에서 이미 상세 로그 찍음
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
