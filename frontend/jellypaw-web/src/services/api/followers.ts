// 팔로워 유저 목록 조회
import apiClient from '@/lib/axios';
import type { GetFollowersResponse } from '@/types/followers';

export const getFollowers = async (nickname: string): Promise<GetFollowersResponse[]> => {
  const response = await apiClient.get(`users/follow/followings/${nickname}`);
  return response.data.data;
};
