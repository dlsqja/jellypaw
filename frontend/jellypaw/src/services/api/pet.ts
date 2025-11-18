import apiClient from '../../lib/apiClient';
import type {
  getPetListResponse,
  getPetDetailResponse,
  CreatePetRequest,
  CreatePetResponse,
  UrineAnalysisResponse,
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
  params: CreatePetRequest & { photoUri?: string | null },
): Promise<CreatePetResponse> => {
  // 1) 필수값 방어 (BE: nullable=false)
  if (!params.name?.trim()) throw new Error('[createPet] name required');
  if (!params.species) throw new Error('[createPet] species required');
  if (!params.gender) throw new Error('[createPet] gender required');
  if (typeof params.age !== 'number')
    throw new Error('[createPet] age required');
  if (typeof params.weight !== 'number')
    throw new Error('[createPet] weight required');

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
    const type = filename.endsWith('.png')
      ? 'image/png'
      : filename.endsWith('.webp')
      ? 'image/webp'
      : 'image/jpeg';

    form.append('petprofileImg', {
      uri: params.photoUri,
      name: filename,
      type,
    } as any);
  }

  try {
    const parts = (form as any)?._parts;
    // console.log('[createPet] ▶ multipart /pets', { parts, hasPhoto: !!params.photoUri });
  } catch {}

  try {
    const res = await apiClient.post<ApiResponse<CreatePetResponse>>(
      '/pets',
      form,
      {
        headers: { Accept: 'application/json' },
        transformRequest: v => v,
      },
    );

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
      throw new Error(
        `[API] code=${res.data.code} msg=${res.data.message || 'UNKNOWN'}`,
      );
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

// ────────────────────────────────────────────────────────────
// 추가 ①: 정보 수정 (PATCH /pets/{petId}) – JSON
// 백엔드 스웨거: /pets/{petId} PATCH, body: PetRequest (JSON)
// ────────────────────────────────────────────────────────────
export const updatePetInfo = async (
  petId: number,
  params: CreatePetRequest, // PetRequest와 동일 스키마: name, species, gender, age, weight
): Promise<CreatePetResponse> => {
  // 필수값 방어 (BE는 nullable=false)
  if (!params.name?.trim()) throw new Error('[updatePetInfo] name required');
  if (!params.species) throw new Error('[updatePetInfo] species required');
  if (!params.gender) throw new Error('[updatePetInfo] gender required');
  if (typeof params.age !== 'number')
    throw new Error('[updatePetInfo] age required');
  if (typeof params.weight !== 'number')
    throw new Error('[updatePetInfo] weight required');

  const body = {
    name: params.name.trim(),
    species: params.species,
    gender: params.gender,
    age: params.age,
    weight: params.weight,
  };

  try {
    const res = await apiClient.patch<ApiResponse<CreatePetResponse>>(
      `/pets/${petId}`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );
    if (res.data?.code && res.data.code !== 200) {
      throw new Error(
        `[API] code=${res.data.code} msg=${res.data.message || 'UNKNOWN'}`,
      );
    }
    return res.data.data;
  } catch (err: any) {
    console.log('[updatePetInfo] ✖ 실패', {
      message: err?.message,
      status: err?.response?.status,
      resp: err?.response?.data,
    });
    throw err;
  }
};

// ────────────────────────────────────────────────────────────
// 추가 ②: 이미지 수정 (PATCH /pets/img/{petId})
// 스웨거에선 requestBody가 application/json로 표기돼 있지만
// 실제 파일 업로드이므로 FormData 전송 (필드명: petProfileImg)
// ────────────────────────────────────────────────────────────
export const updatePetImage = async (
  petId: number,
  photoUri: string,
): Promise<CreatePetResponse> => {
  if (!photoUri) throw new Error('[updatePetImage] photoUri required');

  const form = new FormData();
  const filename = (photoUri.split('/').pop() || 'pet.jpg')
    .trim()
    .toLowerCase();
  const type = filename.endsWith('.png')
    ? 'image/png'
    : filename.endsWith('.webp')
    ? 'image/webp'
    : 'image/jpeg';

  // ⚠️ 필드명: petProfileImg (대문자 P) – 생성과 다름!
  form.append('petProfileImg', { uri: photoUri, name: filename, type } as any);

  try {
    const res = await apiClient.patch<ApiResponse<CreatePetResponse>>(
      `/pets/img/${petId}`,
      form,
      {
        headers: { Accept: 'application/json' },
        transformRequest: v => v,
      },
    );
    if (res.data?.code && res.data.code !== 200) {
      throw new Error(
        `[API] code=${res.data.code} msg=${res.data.message || 'UNKNOWN'}`,
      );
    }
    return res.data.data;
  } catch (err: any) {
    console.log('[updatePetImage] ✖ 실패', {
      message: err?.message,
      status: err?.response?.status,
      resp: err?.response?.data,
    });
    throw err;
  }
};

// ─────────────────────────────────────────────
// 이미지 삭제 (예시: PATCH /pets/img/{petId} { delete: true })
// ─────────────────────────────────────────────
export const deletePetImage = async (
  petId: number,
): Promise<CreatePetResponse> => {
  try {
    const res = await apiClient.patch<ApiResponse<CreatePetResponse>>(
      `/pets/img/${petId}`,
      { delete: true }, // ★ BE와 합의한 키로 수정
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    if (res.data?.code && res.data.code !== 200) {
      throw new Error(
        `[API] code=${res.data.code} msg=${res.data.message || 'UNKNOWN'}`,
      );
    }

    return res.data.data;
  } catch (err: any) {
    console.log('[deletePetImage] ✖ 실패', {
      message: err?.message,
      status: err?.response?.status,
      resp: err?.response?.data,
    });
    throw err;
  }
};



// ────────────────────────────────────────────────────────────
// 추가 ③: 삭제 (DELETE /pets/{petId})
// ────────────────────────────────────────────────────────────
export const deletePet = async (petId: number): Promise<void> => {
  try {
    const res = await apiClient.delete<ApiResponse<object>>(`/pets/${petId}`);
    if (res.data?.code && res.data.code !== 200) {
      throw new Error(
        `[API] code=${res.data.code} msg=${res.data.message || 'UNKNOWN'}`,
      );
    }
  } catch (err: any) {
    console.log('[deletePet] ✖ 실패', {
      message: err?.message,
      status: err?.response?.status,
      resp: err?.response?.data,
    });
    throw err;
  }
};

// ────────────────────────────────────────────────────────────
// 소변 검사 분석 (POST /pets/{petId}/analyze)
// ────────────────────────────────────────────────────────────
export const analyzeUrineTest = async (
  petId: number,
  imageUri: string,
): Promise<UrineAnalysisResponse> => {
  if (!imageUri) {
    throw new Error('[analyzeUrineTest] imageUri required');
  }

  // FormData 생성
  const form = new FormData();
  
  // 이미지 파일 추가
  const filename = (imageUri.split('/').pop() || 'image.jpg')
    .trim()
    .toLowerCase();
  const type = filename.endsWith('.png')
    ? 'image/png'
    : filename.endsWith('.webp')
    ? 'image/webp'
    : 'image/jpeg';

  form.append('file', {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  try {
    const res = await apiClient.post<ApiResponse<UrineAnalysisResponse>>(
      `/pets/${petId}/analyze`,
      form,
      {
        headers: { Accept: 'application/json' },
        transformRequest: (data) => data,
      },
    );

    if (res.data?.code && res.data.code !== 200 && res.data.code !== 0) {
      throw new Error(
        `[API] code=${res.data.code} msg=${res.data.message || 'UNKNOWN'}`,
      );
    }

    return res.data.data;
  } catch (err: any) {
    console.log('[analyzeUrineTest] ✖ 실패', {
      message: err?.message,
      status: err?.response?.status,
      resp: err?.response?.data,
    });
    throw err;
  }
};

// ────────────────────────────────────────────────────────────
// 소변 검사 분석 결과 조회 (GET /pets/{petId}/analyze/{analysisId})
// ────────────────────────────────────────────────────────────
export const getUrineAnalysisResult = async (
  petId: number,
  analysisId: string,
): Promise<UrineAnalysisResponse> => {
  if (!analysisId) {
    throw new Error('[getUrineAnalysisResult] analysisId required');
  }

  try {
    const res = await apiClient.get<ApiResponse<UrineAnalysisResponse>>(
      `/pets/${petId}/analyze/${analysisId}`,
    );

    if (res.data?.code && res.data.code !== 200 && res.data.code !== 0) {
      throw new Error(
        `[API] code=${res.data.code} msg=${res.data.message || 'UNKNOWN'}`,
      );
    }

    return res.data.data;
  } catch (err: any) {
    console.log('[getUrineAnalysisResult] ✖ 실패', {
      message: err?.message,
      status: err?.response?.status,
      resp: err?.response?.data,
    });
    throw err;
  }
};
