import apiClient from '@/lib/axios';
import type { GetFollowersResponse, GetFollowingResponse } from '@/types/followers';

// 팔로워 유저 목록 조회
export const getFollowers = async (nickname: string): Promise<GetFollowersResponse[]> => {
  const response = await apiClient.get(`users/follow/followings/${nickname}`);
  return response.data.data;
};

// 팔로잉 유저 목록 조회
export const getFollowing = async (nickname: string): Promise<GetFollowingResponse[]> => {
  const response = await apiClient.get(`users/follow/followers/${nickname}`);
  return response.data.data;
};

// 팔로우
export const follow = async (nickname: string): Promise<GetFollowingResponse> => {
  const response = await apiClient.post(`users/follow/${nickname}`);
  return response;
};

// 언팔로우
export const unfollow = async (nickname: string): Promise<GetFollowingResponse> => {
  const response = await apiClient.delete(`users/follow/${nickname}`);
  return response;
};
