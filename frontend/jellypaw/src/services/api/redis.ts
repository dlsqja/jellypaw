import apiClient from '../../lib/apiClient';
import type { ApiResponse } from '../../types/common/api';
import type { RedisBoardResponse } from '../../types/main/redis';

export const getRedisBoard = async (): Promise<RedisBoardResponse | null> => {
  console.log('[RN] getRedisBoard START');

  try {
    const res = await apiClient.get<ApiResponse<RedisBoardResponse | null>>('/redis/get');

    console.log('[RN] getRedisBoard RES', {
      status: res.status,
      code: res.data?.code,
      message: res.data?.message,
      hasData: !!res.data?.data,
      boardId: res.data?.data?.boardId,
    });

    return res.data.data ?? null;
  } catch (err: any) {
    console.log('[RN] getRedisBoard ERROR', {
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
      url: err?.config?.url,
    });
    throw err;
  }
};
