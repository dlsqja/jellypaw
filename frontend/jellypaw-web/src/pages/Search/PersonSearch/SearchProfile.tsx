import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { SearchUsersDetailResponse } from '@/types/search';
import { Spinner } from '@/components/ui/spinner';
import { BsPersonCircle } from 'react-icons/bs';
import { follow, unfollow } from '@/services/api/followers';
import { useProfile } from '@/hooks/queries/ProfileQuery';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

interface SearchProfileProps {
  profileData: SearchUsersDetailResponse | null;
  isLoading: boolean;
  targetUserId?: number;
  onProfileUpdate?: () => void; // 프로필 데이터 갱신 콜백
}

export default function SearchProfile({ profileData, isLoading, targetUserId, onProfileUpdate }: SearchProfileProps) {
  // 현재 로그인한 사용자 프로필
  const { data: myProfile } = useProfile();

  // 팔로잉 상태
  const [isFollowing, setIsFollowing] = useState(false);
  // 로컬 팔로워 수
  const [localFollowerNum, setLocalFollowerNum] = useState<number | undefined>(profileData?.followerNum);

  // 자신의 프로필인지 확인 (타입 변환 포함)
  const isMyProfile = myProfile?.userId !== undefined && targetUserId !== undefined && Number(myProfile.userId) === Number(targetUserId);

  // 프로필 데이터가 변경될 때 로컬 팔로워 수 동기화
  useEffect(() => {
    setLocalFollowerNum(profileData?.followerNum);
  }, [profileData?.followerNum]);

  const handleFollowClick = () => {
    // 자신의 프로필이면 alert 표시하고 종료
    if (isMyProfile) {
      alert('자신의 프로필은 팔로우할 수 없습니다.');
      return;
    }

    if (!profileData?.nickname) return;

    const nickname = profileData.nickname;
    // 현재 팔로워 수
    const currentFollowerNum = localFollowerNum || 0;

    if (isFollowing) {
      // 팔로우 취소
      unfollow(nickname)
        .then((response) => {
          console.log('언팔로우 성공:', response);
          setIsFollowing(false);
          // 팔로워 수 즉시 감소
          setLocalFollowerNum(Math.max(0, currentFollowerNum - 1));
          // 프로필 데이터 다시 조회
          if (onProfileUpdate) {
            onProfileUpdate();
          }
        })
        .catch((error) => {
          console.error('언팔로우 실패:', error);
        });
    } else {
      // 팔로우
      follow(nickname)
        .then((response) => {
          console.log('팔로우 성공:', response);
          setIsFollowing(true);
          // 팔로워 수 즉시 증가
          setLocalFollowerNum(currentFollowerNum + 1);
          // 프로필 데이터 다시 조회
          if (onProfileUpdate) {
            onProfileUpdate();
          }
        })
        .catch((error) => {
          console.error('팔로우 실패:', error);
        });
    }
  };
  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 py-8">
        <Spinner className="size-8 text-aqua-500" />
        <span className="text-gray-300 p2">프로필을 불러오는 중...</span>
      </div>
    );
  }
  // 프로필 데이터가 없으면 표시하지 않음
  if (!profileData) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 py-8">
        <p className="text-gray-500 p2">프로필을 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col justify-center items-center gap-2">
        {profileData.profileImg ? (
          <img className="w-24 h-24 rounded-full object-cover" src={`${IMAGE_BASE_URL}${profileData.profileImg}`} alt="프로필" />
        ) : (
          <BsPersonCircle className="w-24 h-24 text-aqua-300" />
        )}
        <div className="text-aqua-500 h4-b">{profileData.nickname || '닉네임 없음'}</div>
        {profileData.description && <div className="text-aqua-500 p2 text-center break-words max-w-xs">{profileData.description}</div>}
      </div>

      <div className="flex flex-col gap-4 pt-4 justify-center items-center">
        <div className="w-72 h-12 flex justify-center items-center gap-8">
          <div className="w-11 h-12 flex flex-col items-center">
            <div className="justify-center text-aqua-500 p2">게시물</div>
            <div className="justify-center text-aqua-500 h4-b">{profileData.postCount || 0}</div>
          </div>
          <div className="w-10 h-12 flex flex-col items-center">
            <div className="justify-center text-aqua-500 p2">팔로잉</div>
            <div className="justify-center text-aqua-500 h4-b">{profileData.followingNum || 0}</div>
          </div>
          <div className="w-10 h-12 flex flex-col items-center">
            <div className="justify-center text-aqua-500 p2">팔로워</div>
            <div className="justify-center text-aqua-500 h4-b">{localFollowerNum ?? profileData?.followerNum ?? 0}</div>
          </div>
        </div>
        {targetUserId && !isMyProfile && (
          <Button
            size="default"
            shape={isFollowing ? 'outline' : 'solid'}
            tone={isFollowing ? 'lightAqua' : 'aqua'}
            borderTone={isFollowing ? 'default' : 'gray'}
            onClick={handleFollowClick}
          >
            <span className={`p2-b ${isFollowing ? 'text-aqua-300' : 'text-white'}`}>{isFollowing ? '팔로잉' : '팔로우'}</span>
          </Button>
        )}
      </div>
    </>
  );
}
