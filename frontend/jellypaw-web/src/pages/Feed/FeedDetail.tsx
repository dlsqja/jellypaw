import BackHeader from '@/components/headers/BackHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import Comment from './Components/Comments';
import CommentInput from './Components/CommentInput';
import { getFeedDetail, getComments } from '@/services/api/feed';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { GetFeedDetailResponse, GetCommentsResponse } from '@/types/feed';
import { FaPaw } from 'react-icons/fa';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export default function FeedDetail() {
  const { boardId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const feedFromState = (location.state as { feed?: GetFeedDetailResponse } | undefined)?.feed ?? null;

  const [detailData, setDetailData] = useState<GetFeedDetailResponse | null>(feedFromState);
  const [comments, setComments] = useState<GetCommentsResponse[]>([]);
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // 전달된 게시글 데이터가 있으면 그대로 사용, 없으면 백업으로 상세 조회
  useEffect(() => {
    if (feedFromState) {
      setDetailData(feedFromState);
    } else if (boardId) {
      getFeedDetail(Number(boardId)).then((detail) => {
        setDetailData(detail);
        console.log('detailData', detail);
      });
    }
  }, [feedFromState, boardId]);

  useEffect(() => {
    if (!carouselApi) return;
    if ((detailData?.images?.length ?? 0) <= 1) {
      return;
    }

    setCurrentSlide(carouselApi.selectedScrollSnap());
    const handler = () => setCurrentSlide(carouselApi.selectedScrollSnap());

    carouselApi.on('select', handler);
    return () => {
      carouselApi.off('select', handler);
    };
  }, [carouselApi]);

  // 댓글 조회
  useEffect(() => {
    if (!boardId) {
      return;
    }

    getComments(Number(boardId)).then((comments) => {
      console.log('comments', comments);
      setComments(comments);
      setReplyTargetId(null);
    });
  }, [boardId]);

  // 댓글 새로고침
  const refreshComments = () => {
    if (!boardId) {
      return;
    }
    getComments(Number(boardId)).then((comments) => {
      setComments(comments);
      setReplyTargetId(null);
    });
  };

  // 답글 선택
  const handleReplySelect = (commentId: number | null) => {
    setReplyTargetId((prev) => (prev === commentId ? null : commentId));
  };

  // 날짜 포맷팅 함수 (YY.MM.DD 형식)
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const datePart = dateString.split(' ')[0];
    const [year, month, day] = datePart.split('-');
    if (year && month && day) {
      const shortYear = year.slice(-2);
      return `${shortYear}.${month}.${day}`;
    }
    return datePart;
  };

  // 상대 시간 포맷팅 함수 (몇 시간 전, 몇 일 전 등)
  const formatRelativeTime = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMinutes < 60) {
        return `${diffMinutes}분 전`;
      }
      const diffHours = Math.floor(diffMinutes / 60);
      const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

      if (isToday && diffHours < 24) {
        return `${diffHours}시간 전`;
      }
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays < 1) {
        return '오늘';
      } else if (diffDays < 30) {
        return `${diffDays}일 전`;
      } else if (diffDays < 365) {
        const diffMonths = Math.floor(diffDays / 30);
        return `${diffMonths}개월 전`;
      } else {
        const diffYears = Math.floor(diffDays / 365);
        return `${diffYears}년 전`;
      }
    } catch (error) {
      console.error('날짜 파싱 오류:', error);
      return formatDate(dateString);
    }
  };
  return (
    <>
      <BackHeader title="게시글" />

      {/* 프로필 헤더 */}
      <Card className="rounded-none shadow-none border-none bg-gray-100">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between gap-3">
            {/* 프로필 이미지 */}
            {/* 클릭 시 프로필 페이지로 이동 */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => {
                if (detailData?.boardUser?.id) {
                  navigate(`/search/person/${detailData.boardUser.id}`);
                }
              }}
            >
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
                <div className="text-aqua-500 p3">{formatRelativeTime(detailData?.createdAt)}</div>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* 댓글 입력창과의 간격을 위해 padding 추가 */}
        <CardContent className="pb-2">
          {/* 게시글 이미지 없으면  이미지 표시 안함 */}
          {detailData?.images && detailData.images.length > 0 ? (
            // 이미지가 1개면 이미지 표시
            detailData.images.length === 1 ? (
              <div className="w-full h-96 relative rounded-[12px] overflow-hidden">
                <img className="w-full h-full rounded-[12px] object-cover" src={`${IMAGE_BASE_URL}${detailData.images[0]}`} alt="게시글 이미지" />
              </div>
            ) : (
              // 이미지가 여러개면 캐러셀 표시
              <Carousel className="w-full" setApi={setCarouselApi}>
                <CarouselContent>
                  {detailData.images.map((image, index) => (
                    <CarouselItem key={image ?? index}>
                      <div className="w-full h-96 relative rounded-[12px] overflow-hidden">
                        <img
                          className="w-full h-full rounded-[12px] object-cover"
                          src={`${IMAGE_BASE_URL}${image}`}
                          alt={`게시글 이미지 ${index + 1}`}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {detailData.images.length > 1 && (
                  <div className="flex justify-center gap-1 mt-3">
                    {detailData.images.map((_, index) => (
                      <div key={index} className={`w-2 h-2 rounded-full ${index === currentSlide ? 'bg-aqua-300' : 'bg-gray-300'}`} />
                    ))}
                  </div>
                )}
              </Carousel>
            )
          ) : null}

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
          </div>

          {/* 댓글 */}
          <div className="flex flex-col gap-4">
            {comments
              .filter((comment): comment is GetCommentsResponse => !!comment && !!comment.userId)
              .map((comment) => (
                <Comment
                  key={comment.id ?? `${comment.userId.id}-${comment.createdAt}`}
                  {...comment}
                  boardId={Number(boardId) || null}
                  onReply={handleReplySelect}
                />
              ))}
          </div>
          {/* 댓글 입력창 */}
          <CommentInput parentId={replyTargetId} onSubmitSuccess={refreshComments} onCancelReply={() => setReplyTargetId(null)} />
        </CardContent>
      </Card>
    </>
  );
}
