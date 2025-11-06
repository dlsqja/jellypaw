// 펫 전체 목록
export interface getPetListResponse {
  name?: string;
  petId?: number;
  photoUrl?: string | null;
}

// 펫 상세 정보
export interface getPetDetailResponse extends getPetListResponse {
  age?: number;
  code?: number;
  gender?: 'FEMALE' | 'FEMALE_NEUTERING' | 'MALE' | 'MALE_NEUTERING' | 'NON';
  species?: 'CAT' | 'DOG';
  weight?: number;
}
