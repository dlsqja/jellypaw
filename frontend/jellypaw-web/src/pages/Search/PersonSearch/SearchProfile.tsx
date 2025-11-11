import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { SearchUsersDetailResponse } from '@/types/search';
import { Spinner } from '@/components/ui/spinner';
import { BsPersonCircle } from 'react-icons/bs';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

interface SearchProfileProps {
  profileData: SearchUsersDetailResponse | null;
  isLoading: boolean;
  targetUserId?: number;
}

export default function SearchProfile({ profileData, isLoading, targetUserId }: SearchProfileProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollowClick = () => {
    setIsFollowing((prev) => !prev);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 py-8">
        <Spinner className="size-8 text-aqua-500" />
        <span className="text-gray-300 p2">프로필을 불러오는 중...</span>
      </div>
    );
  }

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
            <div className="justify-center text-aqua-500 h4-b">{profileData.followerNum || 0}</div>
          </div>
        </div>
        {targetUserId && (
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
