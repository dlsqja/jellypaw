import BackHeader from '@/components/headers/BackHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import Comment from './Components/Comments';
import { getFeedDetail, getComments } from '@/services/api/feed';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { GetFeedDetailResponse, GetCommentsResponse } from '@/types/feed';
import { FaPaw } from 'react-icons/fa';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export default function FeedDetail() {
  const { boardId } = useParams();
  const [detailData, setDetailData] = useState<GetFeedDetailResponse>();
  const [comments, setComments] = useState<GetCommentsResponse[]>([]);

  // 게시글 상세 및 댓글 조회
  useEffect(() => {
    // 게시글 상세 조회
    getFeedDetail(Number(boardId)).then((detailData) => {
      setDetailData(detailData);
      console.log(detailData);
    });
    // 댓글 조회
    getComments(Number(boardId)).then((comments) => {
      setComments(comments);
    });
  }, [boardId]);
  return (
    <>
      <BackHeader title="게시글" />

      {/* 프로필 헤더 */}
      <Card className="rounded-none shadow-none border-none bg-gray-100">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between gap-3">
            {/* 프로필 이미지 */}
            <div className="flex items-center gap-3">
              {/* 프로필 이미지가 있으면 이미지 표시, 없으면 기본 이미지 표시(발자국) */}
              {detailData?.boardUser?.profileImg ? (
                <img
                  className="w-12 h-12 rounded-full object-cover"
                  src={`${IMAGE_BASE_URL}${detailData.boardUser.profileImg}`}
                  alt={detailData?.boardUser?.nickname}
                />
              ) : (
                <div className="w-12 h-12 rounded-full p-1.5 border-2 border-aqua-300 flex justify-center items-center">
                  <FaPaw className="w-12 h-12 text-aqua-300" />
                </div>
              )}
              {/* 프로필 이름 및 게시글 생성 시간 */}
              <div className="flex flex-col">
                <div className="text-aqua-500 p2-b">{detailData?.boardUser?.nickname}</div>
                <div className="text-aqua-500 p3">{detailData?.createdAt}</div>
              </div>
            </div>
            {/* 팔로잉 버튼 */}
            <Button size="sm" shape="pillSolid">
              {detailData?.boardUser?.nickname ? '팔로잉' : '팔로우'}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* 게시글 이미지 */}
          {/* 게시글 이미지가 있으면 이미지 표시, 없으면 기본 이미지 표시(발자국) */}
          {detailData?.images && detailData.images.length > 0 ? (
            detailData.images.map((image) => (
              <img key={image} className="w-full h-96 rounded-[12px] object-cover" src={`${IMAGE_BASE_URL}${image}`} alt="게시글 이미지" />
            ))
          ) : (
            <div className="w-full h-96 rounded-[12px] bg-gray-200 flex justify-center items-center">
              <FaPaw className="w-12 h-12 text-gray-300" />
            </div>
          )}

          {/* 액션 바 및 본문 */}
          {/* 본문 */}
          <div className="">
            <div className="flex justify-between items-center">
              <p className="text-aqua-500 p2-b">
                {detailData?.boardUser?.nickname}
                <span className="text-aqua-500 p2 ml-2">{detailData?.content}</span>
              </p>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="h-10 flex justify-between items-center pt-2">
            <div className="flex items-center">
              <button type="button" className="h-7 flex items-center gap-1 cursor-pointer ">
                <Heart className="h-5 w-5 text-pink-300" />
                <span className="text-aqua-500 p2-b">{detailData?.likeCount || 0}</span>
              </button>
              <button type="button" className="h-7 flex items-center gap-1 ml-4 cursor-pointer ">
                <MessageCircle className="h-5 w-5 text-gray-600" />
                <span className="text-aqua-500 p2-b">{detailData?.commentCount || 0}</span>
              </button>
            </div>
            <button type="button" className="h-7 w-7 flex justify-center items-center cursor-pointer ">
              <Share2 className="h-5 w-5 text-aqua-500" />
            </button>
          </div>

          {/* 댓글 */}
          {comments.map((comment, index) => (
            <Comment key={index} userId={comment.userId} content={comment.content} createdAt={comment.createdAt} />
          ))}
        </CardContent>
      </Card>
    </>
  );
}
