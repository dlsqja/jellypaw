// services/api/redis.ts
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
  // 필요하면 필드 더 추가 (백엔드 BoardResponse 기준)
}

export const getRedisBoard = async (): Promise<BoardResponse | null> => {
  const res = await apiClient.get<ApiResponse<BoardResponse | null>>('/redis/get');
  return res.data.data ?? null;
};

