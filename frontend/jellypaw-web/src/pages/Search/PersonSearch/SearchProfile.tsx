import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 프로필 더미데이터
const profileData = {
  username: '미료 언니',
  description: '초코와 함께하는 일상을 기록하고 있어요 골든리트리버와 함께 행복한 하루하루를 보내고 있습니다.',
  postCount: 12,
  followingCount: 892,
  followerCount: 892,
};

export default function SearchProfile() {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollowClick = () => {
    setIsFollowing((prev) => !prev);
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center gap-2">
        <img className="w-24 h-24" src="/src/assets/search/person1.png" alt="프로필" />
        <div className="text-aqua-500 h4-b">{profileData.username}</div>
        <div className="text-aqua-500 p2 text-center break-words">{profileData.description}</div>
      </div>

      <div className="flex flex-col gap-4 pt-4 justify-center items-center">
        <div className="w-72 h-12 flex justify-center items-center gap-8">
          <div className="w-11 h-12 flex flex-col items-center">
            <div className="justify-center text-aqua-500 p2">게시물</div>
            <div className="justify-center text-aqua-500 h4-b">{profileData.postCount}</div>
          </div>
          <div className="w-10 h-12 flex flex-col items-center">
            <div className="justify-center text-aqua-500 p2">팔로잉</div>
            <div className="justify-center text-aqua-500 h4-b">{profileData.followingCount}</div>
          </div>
          <div className="w-10 h-12 flex flex-col items-center">
            <div className="justify-center text-aqua-500 p2">팔로워</div>
            <div className="justify-center text-aqua-500 h4-b">{profileData.followerCount}</div>
          </div>
        </div>
        <Button
          size="default"
          shape={isFollowing ? 'outline' : 'solid'}
          tone={isFollowing ? 'lightAqua' : 'aqua'}
          borderTone={isFollowing ? 'default' : 'gray'}
          onClick={handleFollowClick}
        >
          <span className={`p2-b ${isFollowing ? 'text-aqua-300' : 'text-white'}`}>{isFollowing ? '팔로잉' : '팔로우'}</span>
        </Button>
      </div>
    </>
  );
}
