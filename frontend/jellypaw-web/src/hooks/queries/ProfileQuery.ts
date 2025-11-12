import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyProfile } from '@/services/api/mypage';
import type { GetProfileResponse } from '@/types/mypage';

const defaultProfileData: GetProfileResponse = {
  userId: 0,
  nickname: '',
  description: '',
  profileImg: '',
  backgroundImg: '',
  followerNum: 0,
  followingNum: 0,
  postCount: 0,
  role: 'USER',
};

// 프로필 쿼리 키
export const profileQueryKeys = {
  // 모든 프로필 관련 쿼리의 기본 키 배열
  all: ['profile'] as const,
  // 내 프로필 조회 쿼리의 구체적인 키를 반환하는 함수 (['profile', 'my'])
  detail: () => [...profileQueryKeys.all, 'my'] as const,
};

// 프로필 조회 쿼리 훅
export const useProfile = () => {
  // React Query의 useQuery 훅을 사용하여 프로필 데이터 조회 및 캐싱
  return useQuery<GetProfileResponse>({
    // 쿼리 키: ['profile', 'my'] - 이 키로 캐시를 식별하고 관리
    queryKey: profileQueryKeys.detail(),
    // 쿼리 함수: getMyProfile API를 호출하여 프로필 데이터를 가져옴
    queryFn: getMyProfile,
    placeholderData: defaultProfileData,
  });
};

// 쿼리 캐시를 관리하는 커스텀 훅 export
export const useProfileQueryClient = () => {
  // React Query의 QueryClient 인스턴스를 가져옴 (캐시 관리용)
  const queryClient = useQueryClient();

  // 캐시 관리 함수들을 반환 - 수정,삭제 후 캐시 무효화
  return {
    // 프로필 쿼리 캐시를 무효화하는 함수
    invalidateProfile: () => {
      // 지정된 쿼리 키의 캐시를 무효화하여 다음 호출 시 자동으로 다시 가져오도록 함
      return queryClient.invalidateQueries({ queryKey: profileQueryKeys.detail() });
    },
  };
};
