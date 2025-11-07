import apiClient from '../../lib/apiClient';
import type { FeedWriteRequest, FeedDetailResponse } from '../../types/main/feedWrite';
// API 응답 래퍼 타입
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 게시글 상세 조회
export const getFeedDetail = async (boardId: string): Promise<FeedDetailResponse> => {
  const res = await apiClient.get<ApiResponse<FeedDetailResponse>>(`/boards/${boardId}`);
  return res.data.data;
};

// 게시글 작성
export const createFeed = async (params: FeedWriteRequest & { newImages?: string[] | null }): Promise<any> => {
  // 필수값 방어 - 제목, 내용만
  if (!params.title?.trim()) throw new Error('[createFeed] title required');
  if (!params.content?.trim()) throw new Error('[createFeed] content required');

  // newImages 제외한 나머지 요청 파라미터 추출
  const { newImages, ...boardRequest } = params;

  // FormData 생성
  const form = new FormData();

  // boardRequest를 JSON 문자열로 변환하여 FormData에 추가
  const json = JSON.stringify(boardRequest);
  form.append('boardRequest', { string: json, type: 'application/json' } as any);

  // newImages 배열에 이미지 파일 추가
  const validImageUris = newImages?.filter((uri): uri is string => typeof uri === 'string') || [];

  // 이미지 파일이 있는 경우 배열에 추가
  if (validImageUris.length > 0) {
    // 이미지 파일 배열에 추가
    validImageUris.forEach((uri) => {
      const filename = (uri.split('/').pop() || 'image.jpg').trim().toLowerCase();
      const type = filename.endsWith('.png') ? 'image/png' : filename.endsWith('.webp') ? 'image/webp' : 'image/jpeg';

      // 이미지 파일 추가
      form.append('newImages', { uri, name: filename, type } as any);
    });
  }

  // 게시글 작성 요청
  const res = await apiClient.post<ApiResponse<any>>('/boards', form, {
    headers: { Accept: 'application/json' },
    transformRequest: (data) => {
      return data;
    },
  });

  // 200(성공) 아닌 경우
  if (res.data?.code && res.data.code !== 200) {
    // axios 에러 객체를 생성하여 throw (response, config 정보 포함)
    const error: any = new Error(`[API] code=${res.data.code} msg=${res.data.message || 'UNKNOWN'}`);
    error.response = {
      status: res.status,
      data: res.data,
    };
    error.config = res.config;
    throw error;
  }
  // 게시글 작성 응답 반환
  return res.data.data;
};
