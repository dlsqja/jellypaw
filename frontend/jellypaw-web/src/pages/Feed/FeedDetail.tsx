import BackHeader from '@/components/headers/BackHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

interface FeedDetailProps {
  name?: string;
  profileImageUrl?: string;
  createdAt?: string;
  postImageUrl?: string;
  content?: string;
  likeCount?: number;
  commentCount?: number;
  isFollowing?: boolean;
}

const dummyData: FeedDetailProps = {
  name: '멍멍이집사',
  profileImageUrl: '/src/assets/pets/반려동물1.png',
  createdAt: '2시간 전',
  postImageUrl: '/src/assets/articles/게시글 사진.png',
  content: '오늘 공원에서 신나게 뛰어놀았어요! 날씨도 좋고 행복한 하루였습니다 🐕💕',
  likeCount: 234,
  commentCount: 45,
  isFollowing: false,
};

export default function FeedDetail() {
  return (
    <>
      <BackHeader title="게시글" />

      {/* 프로필 헤더 */}
      <Card className="rounded-none shadow-none border-none bg-gray-100">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img className="w-12 h-12 rounded-full object-cover" src={dummyData.profileImageUrl} alt={dummyData.name} />
              <div className="flex flex-col">
                <div className="text-aqua-500 p2-b">{dummyData.name}</div>
                <div className="text-aqua-500 p3">{dummyData.createdAt}</div>
              </div>
            </div>
            <Button size="sm" shape="pillSolid">
              {dummyData.isFollowing ? '팔로잉' : '팔로우'}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* 이미지 */}
          <img className="w-full h-96 object-cover" src={dummyData.postImageUrl} alt="게시글 이미지" />

          {/* 액션 바 및 본문 */}

          {/* 액션 버튼들 */}
          <div className="h-10 flex justify-between items-center pt-2">
            <div className="flex items-center">
              <button type="button" className="h-7 flex items-center gap-1 cursor-pointer hover:opacity-70">
                <Heart className="h-5 w-5 text-pink-300" />
                <span className="text-aqua-500 p2-b">{dummyData.likeCount}</span>
              </button>
              <button type="button" className="h-7 flex items-center gap-1 ml-4 cursor-pointer hover:opacity-70">
                <MessageCircle className="h-5 w-5 text-gray-600" />
                <span className="text-aqua-500 p2-b">{dummyData.commentCount}</span>
              </button>
            </div>
            <button type="button" className="h-7 w-7 flex justify-center items-center cursor-pointer hover:opacity-70">
              <Share2 className="h-5 w-5 text-aqua-500" />
            </button>
          </div>

          {/* 본문 */}
          <div className="pb-4">
            <div className="flex gap-1">
              <p className="text-aqua-500 p2-b">{dummyData.name}</p>
              <p className="text-aqua-500 p3">{dummyData.content}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
