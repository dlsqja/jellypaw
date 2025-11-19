import apiClient from '@/lib/axios';
import type {
  SearchUsersResponse,
  SearchPlacesResponse,
  SearchUsersDetailResponse,
  SearchPlacesDetailResponse,
  GetPlaceFeedsResponse,
} from '@/types/search';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 유저 검색
export const searchUsers = async (keyword: string): Promise<SearchUsersResponse[]> => {
  const response = await apiClient.get(`/users/es?nickname=${keyword}`);
  return response.data.data;
};

// 유저 검색 상세 조회
export const searchUsersDetail = async (nickname: string): Promise<SearchUsersDetailResponse> => {
  const response = await apiClient.get(`/users/${nickname}`);
  console.log('response', response);
  return response.data.data;
};

// 장소 검색
export const searchPlaces = async (keyword: string, cursor?: number | 0): Promise<SearchPlacesResponse> => {
  const response = await apiClient.get(`/places/search/cursor?title=${keyword}&cursor=${cursor}`);
  console.log(response.data.data);
  return response.data.data;
};

// 장소 검색 상세 조회
export const searchPlacesDetail = async (placeId: number): Promise<SearchPlacesDetailResponse> => {
  const response = await apiClient.get(`/places/${placeId}`);
  return response.data.data;
};

// 특정 장소의 게시글 조회
export const getPlaceFeeds = async (placeId: number): Promise<GetPlaceFeedsResponse> => {
  const response = await apiClient.get<ApiResponse<GetPlaceFeedsResponse>>(`/board-view/places/${placeId}`);
  return response.data.data;
};
