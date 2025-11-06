// 팔로워 유저 목록 조회
import apiClient from '@/lib/axios';

export const getFollowers = async () => {
  const response = await apiClient.get(`users/follow/followers/카미나리로코큐`);
  return response.data;
};
