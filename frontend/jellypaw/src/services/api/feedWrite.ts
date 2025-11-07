import apiClient from '../../lib/apiClient';

// 🔁 Blob 사용 안 함: 항상 typed string part 사용
function makeJsonPart(jsonString: string): any {
  // RN FormData가 인식하는 "타입이 지정된 문자열 파트"
  return { string: jsonString, type: 'application/json' };
}

export const createFeed = async (params: any) => {
  console.log('[createFeed] ▶ 시작', { params });

  const { boardRequest, newImages } = params;
  console.log('[createFeed] 파라미터 분리', {
    boardRequest,
    newImages,
    imageCount: newImages?.length,
  });

  const formData = new FormData();

  // ✅ boardRequest를 **typed string** 으로만 추가
  const json = JSON.stringify(boardRequest);
  console.log('[createFeed] boardRequest JSON', { json, length: json.length });
  formData.append('boardRequest', makeJsonPart(json) as any);

  // newImages 처리
  if (newImages && Array.isArray(newImages) && newImages.length > 0) {
    console.log('[createFeed] 이미지 추가 시작', {
      imageCount: newImages.length,
    });
    // 이미지가 있는 경우: 각 이미지 파일 추가
    newImages.forEach((uri: string, index: number) => {
      const filename = (uri.split('/').pop() || 'image.jpg')
        .trim()
        .toLowerCase();
      const type = filename.endsWith('.png')
        ? 'image/png'
        : filename.endsWith('.webp')
        ? 'image/webp'
        : 'image/jpeg';

      console.log(`[createFeed] 이미지 ${index + 1} 추가`, {
        uri,
        filename,
        type,
      });
      formData.append('newImages', {
        uri,
        name: filename,
        type,
      } as any);
    });
  } else {
    // 이미지가 없는 경우: 빈 문자열 추가
    console.log('[createFeed] 이미지 없음 - 빈 문자열 추가');
    formData.append('newImages', '');
  }

  // FormData parts 확인
  try {
    const parts = (formData as any)?._parts;
    console.log('[createFeed] ▶ multipart /boards', {
      parts,
      imageCount:
        newImages?.filter((uri: any) => typeof uri === 'string')?.length || 0,
      hasBoardRequest: !!boardRequest,
    });
  } catch (e) {
    console.log('[createFeed] FormData parts 확인 실패', e);
  }

  try {
    const res = await apiClient.post('/boards', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      },
      transformRequest: (data, headers) => {
        console.log('[createFeed] transformRequest', {
          isFormData: data instanceof FormData,
          headers: Object.keys(headers || {}),
        });
        return data;
      },
    });

    console.log('[createFeed] ◀ 응답', {
      httpStatus: res.status,
      code: res.data?.code,
      message: res.data?.message,
      hasData: !!res.data?.data,
      fullResponse: res.data,
    });

    // 응답의 code가 200이 아니면 에러 throw
    if (res.data?.code && res.data.code !== 200) {
      console.error('[createFeed] ✖ API 오류 응답', {
        code: res.data.code,
        message: res.data.message,
      });
      throw new Error(res.data.message || `API 오류: code=${res.data.code}`);
    }

    console.log('[createFeed] ✅ 성공', { data: res.data });
    return res.data;
  } catch (err: any) {
    console.log('[createFeed] ✖ 실패', {
      message: err?.message,
      status: err?.response?.status,
      resp: err?.response?.data,
      url: err?.config?.url,
      method: err?.config?.method,
      sentAuth: err?.config?.headers?.Authorization,
      sentCT: err?.config?.headers?.['Content-Type'],
      stack: err?.stack,
    });
    throw err;
  }
};
