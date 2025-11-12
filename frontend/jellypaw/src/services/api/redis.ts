// RN services/api/redis.ts
import apiClient from '../../lib/apiClient';
import type { ApiResponse } from '../../types/common/api';
import type { RedisBoardResponse } from '../../types/main/redis';

/**
 * Redis에서 현재 유저(X-User-Id)에 해당하는 게시글 수정 데이터 조회
 * X-User-Id는 apiClient 인터셉터에서 JWT를 decode 해서 자동 세팅됨.
 */
export const getRedisBoard = async (): Promise<RedisBoardResponse | null> => {
  const res = await apiClient.get<ApiResponse<RedisBoardResponse | null>>(
    '/redis/get',
  );
  return res.data.data ?? null;
};
