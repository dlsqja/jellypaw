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
export const searchUsersDetail = async (nickname: string): Promise<SearchUsersDetailResponse | null> => {
  const response = await apiClient.get<ApiResponse<SearchUsersDetailResponse>>(`/users/${nickname}`);
  
  // API 응답에서 code가 200이 아니거나 data가 null이면 null 반환 (에러 throw하지 않음)
  // 404는 정상적인 케이스일 수 있음 (사용자 삭제, nickname 변경 등)
  if (response.data.code !== 200 || response.data.data === null) {
    // 로그 제거 - 404는 정상적인 케이스이므로 조용히 처리
    return null;
  }
  
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
