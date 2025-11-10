import apiClient from '@/lib/axios';
import type { SearchUsersResponse } from '@/types/search';
export const searchUsers = async (keyword: string): Promise<SearchUsersResponse[]> => {
  const response = await apiClient.get(`/users/es?nickname=${keyword}`);
  return response.data.data;
};

// export const searchPlaces = async (keyword: string): Promise<SearchPlacesResponse> => {
//     const response = await apiClient.get(`/places/search?keyword=${keyword}`);
//     return response.data.data;
// };
