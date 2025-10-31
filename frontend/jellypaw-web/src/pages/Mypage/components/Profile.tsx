import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
// 프로필 더미데이터
const profileData = {
  username: '멍멍이엄마',
  description: '초코와 함께하는 일상을 기록하고 있어요',
  postCount: 12,
  followingCount: 892,
  followerCount: 892,
};

export default function Profile() {
  const navigate = useNavigate();
  return (
    <Card className="p-4">
      <CardHeader className="pb-0">
        <div className="h-18 flex justify-start items-center gap-4">
          <img className="w-16 h-16 max-w-16" src="/src/assets/search/person1.png" alt="프로필" />
          <div className="flex flex-col justify-center items-start gap-1">
            <div className="text-aqua-500 h6-b">{profileData.username}</div>
            <div className="w-52 h-10 text-gray-700 p2">{profileData.description}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-4">
        <div className="w-72 h-12 flex justify-center items-center gap-5">
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
        <Button size="lg" shape="pillSolid" tone="lightAqua" className="w-full h-11" onClick={() => navigate('/mypage/edit-profile')}>
          <span className="text-aqua-500 p2-b">프로필 편집</span>
        </Button>
      </CardContent>
    </Card>
  );
}
