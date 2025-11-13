import apiClient from '../../lib/apiClient';
import type { FeedWriteRequest, FeedDetailResponse, FeedWritePlaceRequest } from '../../types/main/feedWrite';
// API 응답 래퍼 타입
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 게시글 상세 조회
export const getFeedDetail = async (boardId: string): Promise<FeedDetailResponse> => {
  const response = await apiClient.get<ApiResponse<FeedDetailResponse>>(`/boards/${boardId}`);
  return response.data.data;
};

// 게시글 작성
export const createFeed = async (
  params: FeedWriteRequest & { newImages?: string[] | null } & { placeRequest: FeedWritePlaceRequest },
): Promise<any> => {
  // 필수값 방어 - 제목, 내용만
  if (!params.title?.trim()) throw new Error('[createFeed] title required');
  if (!params.content?.trim()) throw new Error('[createFeed] content required');

  // newImages 제외한 나머지 요청 파라미터 추출
  const { newImages, placeRequest, ...boardRequest } = params;

  // FormData 생성
 const form = new FormData();

form.append('boardRequest', {
  string: JSON.stringify(boardRequest),
  type: 'application/json',
} as any);

if (placeRequest && (
  placeRequest.placeCode || placeRequest.title || placeRequest.address ||
  placeRequest.phoneNumber || (placeRequest.openingHours && placeRequest.openingHours.length) || placeRequest.link
)) {
  form.append('placeRequest', {
    string: JSON.stringify(placeRequest),
    type: 'application/json',
  } as any);
}


// 로컬 파일만 업로드
const validImageUris =
  (newImages || [])
    .filter((u): u is string => typeof u === 'string')
    .filter((u) => u.startsWith('file://') || u.startsWith('content://'));

validImageUris.forEach((uri) => {
  const name = (uri.split('/').pop() || 'image.jpg').toLowerCase();
  const type = name.endsWith('.png') ? 'image/png' :
               name.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
  form.append('newImages', { uri, name, type } as any);
});


  console.log('form', form);
  const response = await apiClient.post<ApiResponse<any>>('/boards', form, {
    headers: { Accept: 'application/json' },
    transformRequest: (data) => data,

  });

  const data = response.data.data as any;

  // 200(성공) 아닌 경우
  if (response.data?.code && response.data.code !== 200) {
    // axios 에러 객체를 생성하여 throw (response, config 정보 포함)
    const error: any = new Error(`[API] code=${response.data.code} msg=${response.data.message || 'UNKNOWN'}`);
    error.response = {
      status: response.status,
      data: response.data,
    };
    error.config = response.config;
    throw error;
  }
  return typeof data === 'object' && data !== null && 'id' in data ? data.id : data;
};

export const updateFeed = async (
  boardId: number,
  params: FeedWriteRequest & { newImages?: string[] | null } & { placeRequest: FeedWritePlaceRequest },
): Promise<any> => {
  if (!params.title?.trim()) throw new Error('[updateFeed] title required');
  if (!params.content?.trim()) throw new Error('[updateFeed] content required');

  const { newImages, placeRequest, ...boardRequest } = params;

  const form = new FormData();

  form.append('boardUpdateRequest', {
    string: JSON.stringify(boardRequest),
    type: 'application/json',
  } as any);

  if (
    placeRequest &&
    (
      placeRequest.placeCode ||
      placeRequest.title ||
      placeRequest.address ||
      placeRequest.phoneNumber ||
      (placeRequest.openingHours && placeRequest.openingHours.length > 0) ||
      placeRequest.link
    )
  ) {
    form.append('placeRequest', {
      string: JSON.stringify(placeRequest),
      type: 'application/json',
    } as any);
  }

  const validImageUris =
    (newImages || [])
      .filter((u): u is string => typeof u === 'string')
      .filter((u) => u.startsWith('file://') || u.startsWith('content://'));

  validImageUris.forEach((uri) => {
    const name = (uri.split('/').pop() || 'image.jpg').toLowerCase();
    const type =
      name.endsWith('.png') ? 'image/png'
      : name.endsWith('.webp') ? 'image/webp'
      : 'image/jpeg';

    form.append('newImages', { uri, name, type } as any);
  });

  const response = await apiClient.put<ApiResponse<any>>(`/boards/${boardId}`, form, {
    headers: { Accept: 'application/json' },
    transformRequest: (data) => data,
  });

  if (response.data?.code && response.data.code !== 200) {
    const error: any = new Error(
      `[API] code=${response.data.code} msg=${response.data.message || 'UNKNOWN'}`
    );
    error.response = { status: response.status, data: response.data };
    error.config = response.config;
    throw error;
  }

  return response.data.data;
};
