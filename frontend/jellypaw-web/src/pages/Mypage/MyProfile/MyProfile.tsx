import { useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaPaw } from 'react-icons/fa';
import { useProfile } from '@/hooks/queries/ProfileQuery';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;
export default function MyProfile() {
  const navigate = useNavigate();
  const location = useLocation();

  // React Query로 프로필 데이터 가져오기
  const { data: profileData, refetch } = useProfile();

  // 경로가 변경될 때 (특히 /mypage로 돌아올 때) 프로필 데이터 새로고침
  useEffect(() => {
    if (location.pathname === '/mypage') {
      refetch();
    }
  }, [location.pathname, refetch]);

  return (
    // 프로필 카드
    <Card className="p-4">
      <CardHeader className="pb-0">
        <div className="h-18 flex justify-start items-center gap-4">
          {profileData?.profileImg ? (
            <img className="w-16 h-16 max-w-16 object-cover rounded-full" src={`${IMAGE_BASE_URL}${profileData?.profileImg}`} alt="프로필" />
          ) : (
            <div className="w-16 h-16 p-3 rounded-full outline outline-2 outline-offset-[-2px] outline-aqua-300 flex flex-col justify-center items-center">
              <FaPaw className="w-14 h-14 text-aqua-300" />
            </div>
          )}
          <div className="flex flex-col justify-center items-start gap-1">
            <div className="text-aqua-500 h6-b">{profileData?.nickname}</div>
            <div className="h-max max-h-10 w-full text-gray-700 p2 line-clamp-2 whitespace-pre-line">{profileData?.description}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-4 justify-center items-center">
        <div className="w-72 h-12 flex justify-center items-center gap-8">
          <div className="w-11 h-12 flex flex-col items-center">
            <div className="justify-center text-aqua-500 p2">게시물</div>
            <div className="justify-center text-aqua-500 h4-b">{profileData?.postCount}</div>
          </div>
          <button
            type="button"
            className="w-10 h-12 flex flex-col items-center cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => navigate('/mypage/followers?type=following')}
          >
            <div className="justify-center text-aqua-500 p2">팔로잉</div>
            <div className="justify-center text-aqua-500 h4-b">{profileData?.followingNum}</div>
          </button>
          <button
            type="button"
            className="w-10 h-12 flex flex-col items-center cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => navigate('/mypage/followers?type=follower')}
          >
            <div className="justify-center text-aqua-500 p2">팔로워</div>
            <div className="justify-center text-aqua-500 h4-b">{profileData?.followerNum}</div>
          </button>
        </div>
        <Button size="lg" shape="solid" tone="lightAqua" className="w-full h-11" onClick={() => navigate('/mypage/edit-profile')}>
          <span className="text-aqua-500 p2-b">프로필 편집</span>
        </Button>
      </CardContent>
    </Card>
  );
}
