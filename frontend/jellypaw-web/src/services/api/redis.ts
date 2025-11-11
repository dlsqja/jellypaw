// services/api/redis.ts
import apiClient from '@/lib/axios';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 게시글 정보 저장 (X-User-Id 헤더는 서버/게이트웨이/인터셉터에서 세팅된다고 가정)
export const saveBoardToRedis = async (payload: any): Promise<void> => {
  await apiClient.post<ApiResponse<void>>('/redis/save', payload);
};
