export type PetSpecies = 'CAT' | 'DOG';
export type PetGender = 'FEMALE' | 'MALE' | 'FEMALE_NEUTERING' | 'MALE_NEUTERING' | 'NON';

// 펫 전체 목록
export interface getPetListResponse {
  name?: string;
  petId?: number;
  species?: 'CAT' | 'DOG';
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

// 반려동물 생성 DTO (서버의 petRequest 에 해당)
export interface CreatePetRequest {
  name: string;
  species?: PetSpecies;
  gender?: PetGender;
  age?: number; // int
  weight?: number; // float
}

// 멀티파트 전송 시, 프론트에서의 필드 형태(참고용)
export interface CreatePetMultipart {
  /** JSON.stringify(CreatePetRequestDTO) */
  petRequest: string;
  /** 선택: 이미지 파일 */
  petprofileImg?: {
    uri: string;
    name: string;
    type: string; // 'image/jpeg' | 'image/png' | 'image/webp' 등
  };
}

// 생성 응답은 상세와 동일 스키마
export type CreatePetResponse = getPetDetailResponse;

// 소변 검사 분석 응답 타입
export interface UrineAnalysisSummaryItem {
  testNameKo: string;
  isNormal: boolean;
  severity: string;
  suspectedConditions: string[];
}

export interface UrineAnalysisResponse {
  id: string;
  userId: number;
  petId: number;
  status: string;
  analysisCount: number;
  summary: UrineAnalysisSummaryItem[];
  createdAt: string;
}

// 검사 결과 목록 조회
export interface getUrineAnalysisListResponse {
  id: string;
  userId: number;
  petId: number;
  status: string;
  analysisCount: number;
  summary: UrineAnalysisSummaryItem[];
  createdAt: string;
}
