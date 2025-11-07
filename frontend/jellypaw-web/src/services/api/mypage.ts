import apiClient from '@/lib/axios';
import type { MyProfileResponse } from '@/types/mypage';

// 내 프로필 조회
export const getMyProfile = async (): Promise<MyProfileResponse> => {
  const response = await apiClient.get('/users/profile');
  return response.data.data;
};

// 내 프로필 수정
// export const updateMyProfile = async (profile: any) => {
//   const response = await apiClient.put('/users/profile', profile);
//   return response.data;
// };
