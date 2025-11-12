import apiClient from '@/lib/axios';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 토큰에서 userId 뽑는 헬퍼 (기존 로직은 안 건드리고 여기서만 사용)
const getUserIdFromToken = (): string | null => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    console.log('[redis:web] no accessToken in localStorage');
    return null;
  }

  try {
    const [, payloadBase64] = accessToken.split('.');
    const payloadJson = atob(
      payloadBase64.replace(/-/g, '+').replace(/_/g, '/'),
    );
    const payload = JSON.parse(payloadJson);

    const userId = payload.userId || payload.id || payload.sub;
    console.log('[redis:web] decoded userId from token =', userId);
    return userId ? String(userId) : null;
  } catch (e) {
    console.error('[redis:web] fail to decode accessToken for X-User-Id', e);
    return null;
  }
};

// 게시글 정보 저장 (upsert)
export const saveBoardToRedis = async (payload: any): Promise<void> => {
  const userId = getUserIdFromToken();
  if (!userId) {
    console.error('[redis:web] X-User-Id 없음 - redis 저장 불가');
    throw new Error('로그인 정보를 확인할 수 없습니다.');
  }

  console.log('[redis:web] saveBoardToRedis START', {
    url: '/redis/save',
    userId,
    payloadSample: {
      boardId: payload?.id || payload?.boardId,
      title: payload?.title,
      hasImages: Array.isArray(payload?.images),
    },
  });

  try {
    const res = await apiClient.post<ApiResponse<void>>(
      '/redis/save',
      payload,
      {
        headers: {
          'X-User-Id': userId,
        },
      },
    );

    console.log('[redis:web] saveBoardToRedis SUCCESS', {
      status: res.status,
      code: res.data?.code,
      message: res.data?.message,
    });
  } catch (err: any) {
    console.error('[redis:web] saveBoardToRedis ERROR', {
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
      url: err?.config?.url,
      headers: err?.config?.headers,
    });
    throw err;
  }
};
