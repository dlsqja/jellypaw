import apiClient from '../../lib/apiClient';
import type {
  getPetListResponse,
  getPetDetailResponse,
} from '../../types/main/pet';

// API 응답 래퍼 타입
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 펫 목록 데이터 타입
interface PetListData {
  petSimpleList: getPetListResponse[];
}

// 펫 목록 조회
export const getPetList = async (): Promise<getPetListResponse[]> => {
  const response = await apiClient.get<ApiResponse<PetListData>>('/pets');
  // petSimpleList 반환
  return response.data.data.petSimpleList;
};

// 펫 상세 조회
export const getPetDetail = async (
  petId: number,
): Promise<getPetDetailResponse> => {
  const response = await apiClient.get<ApiResponse<getPetDetailResponse>>(
    `/pets/${petId}`,
  );
  console.log('펫 상세 정보', response.data);
  return response.data.data;
};
