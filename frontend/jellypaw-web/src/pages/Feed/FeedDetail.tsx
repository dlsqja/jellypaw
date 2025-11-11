import BackHeader from '@/components/headers/BackHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import Comment from './Components/Comments';
import CommentInput from './Components/CommentInput';
import { getFeedDetail, getComments } from '@/services/api/feed';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { GetFeedDetailResponse, GetCommentsResponse } from '@/types/feed';
import { FaPaw } from 'react-icons/fa';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export default function FeedDetail() {
  const { boardId } = useParams();
  const [detailData, setDetailData] = useState<GetFeedDetailResponse>();
  const [comments, setComments] = useState<GetCommentsResponse[]>([]);
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // 게시글 상세 및 댓글 조회
  useEffect(() => {
    // 게시글 상세 조회
    getFeedDetail(Number(boardId)).then((detailData) => {
      setDetailData(detailData);
      console.log('boardId', boardId);
      console.log('detailData', detailData);
    });
    // 댓글 조회
    getComments(Number(boardId)).then((comments) => {
      console.log('comments', comments);
      setComments(comments);
      setReplyTargetId(null);
    });
  }, [boardId]);

  const refreshComments = () => {
    if (!boardId) {
      return;
    }
    getComments(Number(boardId)).then((comments) => {
      setComments(comments);
      setReplyTargetId(null);
    });
  };

  const handleReplySelect = (commentId: number | null) => {
    setReplyTargetId((prev) => (prev === commentId ? null : commentId));
  };

  // 이미지 슬라이더 관련 상태 관리
  useEffect(() => {
    if (!api) {
      return;
    }
    // 현재 선택된 스냅 인덱스 설정
    setCurrent(api.selectedScrollSnap());

    // 스냅 인덱스 변경 시 상태 업데이트
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);
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

        {/* 댓글 입력창과의 간격을 위해 padding 추가 */}
        <CardContent className="pb-2">
          {/* 게시글 이미지 */}
          {/* 게시글 이미지가 있으면 이미지 표시, 없으면 기본 이미지 표시(발자국) */}
          {detailData?.images && detailData.images.length > 0 ? (
            detailData.images.length > 1 ? (
              // 이미지가 2개 이상일 때 Carousel 사용
              <Carousel setApi={setApi} className="w-full relative">
                <CarouselContent>
                  {detailData.images.map((url, index) => (
                    <CarouselItem key={index}>
                      <div className="w-full h-96 relative rounded-[12px]">
                        <img className="w-full h-96 rounded-[12px] object-cover" src={`${IMAGE_BASE_URL}${url}`} alt={`게시글 이미지 ${index + 1}`} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {/* 이미지 인디케이터 */}
                <div className="pt-3 flex justify-center">
                  <div className="flex gap-1">
                    {detailData.images.map((_, index) => (
                      <div key={index} className={`w-2 h-2 rounded-full ${index === current ? 'bg-aqua-300' : 'bg-gray-300'}`} />
                    ))}
                  </div>
                </div>
              </Carousel>
            ) : (
              // 이미지가 1개일 때 단일 이미지 표시
              <img className="w-full h-96 rounded-[12px] object-cover" src={`${IMAGE_BASE_URL}${detailData.images[0]}`} alt="게시글 이미지" />
            )
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
                {detailData?.title}
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
          <div className="flex flex-col gap-4">
            {comments
              .filter((comment): comment is GetCommentsResponse => !!comment && !!comment.userId)
              .map((comment) => (
                <Comment key={comment.id ?? `${comment.userId.id}-${comment.createdAt}`} {...comment} onReply={handleReplySelect} />
              ))}
          </div>
          {/* 댓글 입력창 */}
          <CommentInput parentId={replyTargetId} onSubmitSuccess={refreshComments} onCancelReply={() => setReplyTargetId(null)} />
        </CardContent>
      </Card>
    </>
  );
}
