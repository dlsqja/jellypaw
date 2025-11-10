import apiClient from '@/lib/axios';
import type { SearchUsersResponse, SearchPlacesResponse } from '@/types/search';
export const searchUsers = async (keyword: string): Promise<SearchUsersResponse[]> => {
  const response = await apiClient.get(`/users/es?nickname=${keyword}`);
  return response.data.data;
};

export const searchPlaces = async (keyword: string, cursor?: number | 0): Promise<SearchPlacesResponse> => {
  const response = await apiClient.get(`/places/search/cursor?title=${keyword}&cursor=${cursor}`);
  console.log(response.data.data);
  return response.data.data;
};
