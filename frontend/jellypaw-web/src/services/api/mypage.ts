import apiClient from '@/lib/axios';
import type { GetProfileResponse, EditProfileRequest } from '@/types/mypage';

// 내 프로필 조회
export const getMyProfile = async (): Promise<GetProfileResponse> => {
  const response = await apiClient.get('/users/profile');
  return response.data.data ?? {};
};

// 내 프로필 수정
export const editMyProfile = async (data: EditProfileRequest, profileImg?: File | null) => {
  // FormData 생성
  const form = new FormData();

  // 웹 환경에서는 Blob을 사용하여 JSON 문자열을 application/json 타입으로 추가
  const json = JSON.stringify(data);
  const jsonBlob = new Blob([json], { type: 'application/json' });
  form.append('data', jsonBlob);

  // profileImg가 File 객체인 경우 FormData에 추가 (웹 환경에서는 File 객체를 직접 사용)
  if (profileImg instanceof File) {
    form.append('profileImg', profileImg);
  }

  // FormData를 multipart/form-data로 전송
  const response = await apiClient.put('/users/profile', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
