import BackHeader from '@/components/headers/BackHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import Comment from './Components/Comments';

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

interface CommentProps {
  id: number;
  profileImageUrl: string;
  name: string;
  content: string;
  createdAt: string;
  likeCount: number;
  replyCount: number;
  replies: {
    id: number;
    profileImageUrl: string;
    name: string;
    content: string;
    createdAt: string;
    likeCount: number;
  }[];
}

// 게시글 상세 더미데이터
const detailData: FeedDetailProps = {
  name: '멍멍이집사',
  profileImageUrl: '/src/assets/pets/반려동물1.png',
  createdAt: '2시간 전',
  postImageUrl: '/src/assets/articles/게시글 사진.png',
  content: '오늘 공원에서 신나게 뛰어놀았어요! 날씨도 좋고 행복한 하루였습니다 🐕💕',
  likeCount: 234,
  commentCount: 45,
  isFollowing: false,
};

// 댓글 더미데이터
const commentData: CommentProps[] = [
  {
    id: 1,
    profileImageUrl: '/src/assets/pets/반려동물1.png',
    name: '멍멍이집사',
    content: '오늘 공원에서 신나게 뛰어놀았어요! 날씨도 좋고 행복한 하루였습니다 🐕💕',
    createdAt: '2시간 전',
    likeCount: 20,
    replyCount: 2,
    replies: [
      {
        id: 1,
        profileImageUrl: '/src/assets/pets/반려동물1.png',
        name: '멍멍이집사',
        content: '오늘 공원에서 신나게 뛰어놀았어요! 날씨도 좋고 행복한 하루였습니다 🐕💕',
        createdAt: '2시간 전',
        likeCount: 0,
      },
      {
        id: 2,
        profileImageUrl: '/src/assets/pets/반려동물1.png',
        name: '멍멍이집사',
        content: '오늘 공원에서 신나게 뛰어놀았어요! 날씨도 좋고 행복한 하루였습니다 🐕💕',
        createdAt: '2시간 전',
        likeCount: 0,
      },
    ],
  },
  {
    id: 2,
    profileImageUrl: '/src/assets/pets/반려동물2.png',
    name: '멍멍이집사2',
    content: '오늘 공원에서 신나게 뛰어놀았어요! 날씨도 좋고 행복한 하루였습니다 🐕💕',
    createdAt: '2시간 전',
    likeCount: 20,
    replyCount: 0,
    replies: [],
  },
  {
    id: 3,
    profileImageUrl: '/src/assets/pets/반려동물3.png',
    name: '멍멍이집사3',
    content: '오늘 공원에서 신나게 뛰어놀았어요! 날씨도 좋고 행복한 하루였습니다 🐕💕',
    createdAt: '2시간 전',
    likeCount: 10,
    replyCount: 1,
    replies: [
      {
        id: 1,
        profileImageUrl: '/src/assets/pets/반려동물1.png',
        name: '멍멍이집사',
        content: '오늘 공원에서 신나게 뛰어놀았어요! 날씨도 좋고 행복한 하루였습니다 🐕💕',
        createdAt: '2시간 전',
        likeCount: 9,
      },
    ],
  },
];

export default function FeedDetail() {
  return (
    <>
      <BackHeader title="게시글" />

      {/* 프로필 헤더 */}
      <Card className="rounded-none shadow-none border-none bg-gray-100">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img className="w-12 h-12 rounded-full object-cover" src={detailData.profileImageUrl} alt={detailData.name} />
              <div className="flex flex-col">
                <div className="text-aqua-500 p2-b">{detailData.name}</div>
                <div className="text-aqua-500 p3">{detailData.createdAt}</div>
              </div>
            </div>
            <Button size="sm" shape="pillSolid">
              {detailData.isFollowing ? '팔로잉' : '팔로우'}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* 이미지 */}
          <img className="w-full h-96 rounded-[12px] object-cover" src={detailData.postImageUrl} alt="게시글 이미지" />

          {/* 액션 바 및 본문 */}
          {/* 본문 */}
          <div className="">
            <div className="flex justify-between items-center">
              <p className="text-aqua-500 p2-b">
                {detailData.name}
                <span className="text-aqua-500 p2 ml-2">{detailData.content}</span>
              </p>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="h-10 flex justify-between items-center pt-2">
            <div className="flex items-center">
              <button type="button" className="h-7 flex items-center gap-1 cursor-pointer ">
                <Heart className="h-5 w-5 text-pink-300" />
                <span className="text-aqua-500 p2-b">{detailData.likeCount}</span>
              </button>
              <button type="button" className="h-7 flex items-center gap-1 ml-4 cursor-pointer ">
                <MessageCircle className="h-5 w-5 text-gray-600" />
                <span className="text-aqua-500 p2-b">{detailData.commentCount}</span>
              </button>
            </div>
            <button type="button" className="h-7 w-7 flex justify-center items-center cursor-pointer ">
              <Share2 className="h-5 w-5 text-aqua-500" />
            </button>
          </div>

          {/* 댓글 */}
          {commentData.map((comment, index) => (
            <Comment
              key={index}
              profileImageUrl={comment.profileImageUrl}
              name={comment.name}
              content={comment.content}
              createdAt={comment.createdAt}
              likeCount={comment.likeCount}
              replyCount={comment.replyCount}
              replies={comment.replies}
            />
          ))}
        </CardContent>
      </Card>
    </>
  );
}
