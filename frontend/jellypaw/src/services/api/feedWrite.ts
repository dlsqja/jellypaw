import apiClient from '../../lib/apiClient';
import type { FeedWriteRequest } from '../../types/main/feedWrite';

// API 응답 래퍼 타입
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 🔁 Blob 사용 안 함: 항상 typed string part 사용
function makeJsonPart(jsonString: string): any {
  // RN FormData가 인식하는 "타입이 지정된 문자열 파트"
  return { string: jsonString, type: 'application/json' };
}

export const createFeed = async (
  params: FeedWriteRequest & { newImages?: string[] | null },
): Promise<any> => {
  // 필수값 방어 - 제목, 내용만
  if (!params.title?.trim()) throw new Error('[createFeed] title required');
  if (!params.content?.trim()) throw new Error('[createFeed] content required');

  const { newImages, ...boardRequest } = params;

  const payload: FeedWriteRequest = {
    category: boardRequest.category,
    title: boardRequest.title.trim(),
    content: boardRequest.content.trim(),
    placeId: boardRequest.placeId,
    starRating: boardRequest.starRating,
    visibility: boardRequest.visibility,
  };

  const form = new FormData();

  // ✅ boardRequest를 **typed string** 으로만 추가
  const json = JSON.stringify(payload);
  form.append('boardRequest', makeJsonPart(json) as any);

  // ✅ newImages 배열에 이미지 파일 추가
  // string 타입만 필터링 (number는 require()로 가져온 로컬 이미지이므로 스킵)
  const validImageUris =
    newImages?.filter((uri): uri is string => typeof uri === 'string') || [];

  if (validImageUris.length > 0) {
    validImageUris.forEach(uri => {
      const filename = (uri.split('/').pop() || 'image.jpg')
        .trim()
        .toLowerCase();
      const type = filename.endsWith('.png')
        ? 'image/png'
        : filename.endsWith('.webp')
        ? 'image/webp'
        : 'image/jpeg';

      form.append('newImages', { uri, name: filename, type } as any);
    });
  }

  try {
    const parts = (form as any)?._parts;
    // console.log('[createFeed] ▶ multipart /boards', {
    //   parts,
    //   imageCount: validImageUris.length,
    // });
  } catch {}

  try {
    const res = await apiClient.post<ApiResponse<any>>('/boards', form, {
      headers: { Accept: 'application/json' },
      transformRequest: v => v,
    });

    // console.log('[createFeed] ◀ 응답', {
    //   httpStatus: res.status,
    //   code: res.data?.code,
    //   message: res.data?.message,
    //   hasData: !!res.data?.data,
    // });

    if (res.data?.code && res.data.code !== 200) {
      // axios 에러 객체를 생성하여 throw (response, config 정보 포함)
      const error: any = new Error(
        `[API] code=${res.data.code} msg=${res.data.message || 'UNKNOWN'}`,
      );
      error.response = {
        status: res.status,
        data: res.data,
      };
      error.config = res.config;
      throw error;
    }
    return res.data.data;
  } catch (err: any) {
    console.log('[createFeed] ✖ 실패', {
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
