// RN services/api/redis.ts
import apiClient from '../../lib/apiClient';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface BoardResponse {
  boardId: number;
  title: string;
  content: string;
  images: string[];
  starRating: number;
  category: string;
  place?: {
    placeCode: string;
    title: string;
    address: string;
    phoneNumber?: string;
    openingHours?: string[];
    link?: string;
  } | null;
}

// RN에서도 userId 얻는 방식에 맞춰서 구현 (secure storage, context 등)
const getUserIdForRN = (): string | null => {
  // 예시: AsyncStorage 등에 저장해둔 값
  // 실제 구현에 맞게 교체
  return null;
};

export const getRedisBoard = async (): Promise<BoardResponse | null> => {
  const userId = getUserIdForRN();
  if (!userId) {
    throw new Error('로그인 정보를 찾을 수 없습니다.');
  }

  const res = await apiClient.get<ApiResponse<BoardResponse | null>>(
    '/redis/get',
    {
      headers: {
        'X-User-Id': userId,
      },
    },
  );
  return res.data.data ?? null;
};
