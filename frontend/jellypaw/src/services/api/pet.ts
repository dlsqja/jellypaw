import apiClient from '../../lib/apiClient';
import type {
  getPetListResponse,
  getPetDetailResponse,
  CreatePetRequest,
  CreatePetResponse,
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


// 🔁 Blob 사용 안 함: 항상 typed string part 사용
function makeJsonPart(jsonString: string): any {
  // RN FormData가 인식하는 "타입이 지정된 문자열 파트"
  return { string: jsonString, type: 'application/json' };
}

export const createPet = async (
  params: CreatePetRequest & { photoUri?: string | null }
): Promise<CreatePetResponse> => {
  // 1) 필수값 방어 (BE: nullable=false)
  if (!params.name?.trim()) throw new Error('[createPet] name required');
  if (!params.species)        throw new Error('[createPet] species required');
  if (!params.gender)         throw new Error('[createPet] gender required');
  if (typeof params.age    !== 'number') throw new Error('[createPet] age required');
  if (typeof params.weight !== 'number') throw new Error('[createPet] weight required');

  const payload: CreatePetRequest = {
    name: params.name.trim(),
    species: params.species,
    gender: params.gender,
    age: params.age,
    weight: params.weight,
  };

  const form = new FormData();

  // ✅ petRequest 를 **typed string** 으로만 추가
  const json = JSON.stringify(payload);
  form.append('petRequest', makeJsonPart(json) as any);

  if (params.photoUri) {
    const uri = params.photoUri;
    const filename = (uri.split('/').pop() || 'pet.jpg').trim().toLowerCase();
    const type =
      filename.endsWith('.png')  ? 'image/png'  :
      filename.endsWith('.webp') ? 'image/webp' : 'image/jpeg';

    form.append('petprofileImg', { uri: params.photoUri, name: filename, type } as any);
  }

  try {
    const parts = (form as any)?._parts;
    // console.log('[createPet] ▶ multipart /pets', { parts, hasPhoto: !!params.photoUri });
  } catch {}

  try {
    const res = await apiClient.post<ApiResponse<CreatePetResponse>>('/pets', form, {
      headers: { Accept: 'application/json' },
      transformRequest: v => v,
    });

    // console.log('[createPet] ◀ 응답', {
    //   httpStatus: res.status,
    //   code: res.data?.code,
    //   message: res.data?.message,
    //   hasData: !!res.data?.data,
    //   dataEcho: res.data?.data
    //     ? { id: res.data.data.petId, name: res.data.data.name, photoUrl: res.data.data.photoUrl }
    //     : null,
    // });

    if (res.data?.code && res.data.code !== 200) {
      throw new Error(`[API] code=${res.data.code} msg=${res.data.message || 'UNKNOWN'}`);
    }
    return res.data.data;
  } catch (err: any) {
    console.log('[createPet] ✖ 실패', {
      message: err?.message,
      status: err?.response?.status,
      resp: err?.response?.data,
      url: err?.config?.url,
      method: err?.config?.method,
      sentAuth: err?.config?.headers?.Authorization,
      sentCT: err?.config?.headers?.['Content-Type'],
    });
    throw err;
  }
};