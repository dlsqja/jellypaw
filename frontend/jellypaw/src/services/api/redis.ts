import apiClient from '../../lib/apiClient';
import type { ApiResponse } from '../../types/common/api';
import type { RedisBoardResponse } from '../../types/main/redis';

/**
 * Redis에서 현재 유저(X-User-Id)에 해당하는 게시글 수정 데이터 조회
 * X-User-Id는 apiClient 인터셉터에서 JWT를 decode 해서 자동 세팅됨.
 */
export const getRedisBoard = async (): Promise<RedisBoardResponse | null> => {
  console.log('[rn:redis:get] START /redis/get');

  try {
    const res = await apiClient.get<ApiResponse<RedisBoardResponse | null>>(
      '/redis/get',
    );

    console.log('[rn:redis:get] RESPONSE', {
      status: res.status,
      code: res.data?.code,
      message: res.data?.message,
      hasData: !!res.data?.data,
      boardId: res.data?.data?.boardId,
    });

    return res.data.data ?? null;
  } catch (err: any) {
    console.log('[rn:redis:get] ERROR', {
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
      url: err?.config?.url,
      headers: err?.config?.headers,
    });
    throw err;
  }
};
