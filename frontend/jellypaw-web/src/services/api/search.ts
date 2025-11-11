import apiClient from '@/lib/axios';
import type { SearchUsersResponse, SearchPlacesResponse, SearchUsersDetailResponse } from '@/types/search';

// 유저 검색
export const searchUsers = async (keyword: string): Promise<SearchUsersResponse[]> => {
  const response = await apiClient.get(`/users/es?nickname=${keyword}`);
  return response.data.data;
};

// 유저 검색 상세 조회
export const searchUsersDetail = async (targetUserId: number): Promise<SearchUsersDetailResponse> => {
  const response = await apiClient.get(`/users/${targetUserId}`);
  return response.data.data;
};
// 장소 검색
export const searchPlaces = async (keyword: string, cursor?: number | 0): Promise<SearchPlacesResponse> => {
  const response = await apiClient.get(`/places/search/cursor?title=${keyword}&cursor=${cursor}`);
  console.log(response.data.data);
  return response.data.data;
};
