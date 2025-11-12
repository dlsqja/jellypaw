// services/api/redis.ts
import apiClient from '@/lib/axios';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 토큰에서 userId 뽑는 헬퍼 (기존 로직은 안 건드리고 여기서만 사용)
const getUserIdFromToken = (): string | null => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) return null;

  try {
    const [, payloadBase64] = accessToken.split('.');
    const payloadJson = atob(
      payloadBase64.replace(/-/g, '+').replace(/_/g, '/'),
    );
    const payload = JSON.parse(payloadJson);

    // 백엔드 JWT payload 키에 맞춰서 사용 (userId / id / sub 중 실제 쓰는 값)
    const userId = payload.userId || payload.id || payload.sub;
    return userId ? String(userId) : null;
  } catch (e) {
    console.error('fail to decode accessToken for X-User-Id', e);
    return null;
  }
};

// 게시글 정보 저장 (upsert)
export const saveBoardToRedis = async (payload: any): Promise<void> => {
  const userId = getUserIdFromToken();
  if (!userId) {
    console.error('X-User-Id 없음 - redis 저장 불가');
    throw new Error('로그인 정보를 확인할 수 없습니다.');
  }

  const res = await apiClient.post<ApiResponse<void>>(
    '/redis/save',
    payload,
    {
      headers: {
        'X-User-Id': userId,
      },
    },
  );
  console.log('redis save success', res.data);
};

// (RN에서만 쓰는 getRedisBoard는 다른 파일이니까 웹에 필요 없으면 생략)
