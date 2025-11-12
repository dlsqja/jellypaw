import { useState } from 'react';
import { MoreHorizontal, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MdRestaurant } from 'react-icons/md';
import IconText from '@/components/texts/IconText';
import { Badge } from '@/components/ui/badge';
import { FaStar } from 'react-icons/fa6';
import { FaPaw } from 'react-icons/fa';
import type { GetFeedsResponse } from '@/types/feed';
import { useNavigate } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { Button } from '@/components/ui/button';
import { deleteFeed } from '@/services/api/feed';
import { getFeedDetail } from '@/services/api/feed';
import { saveBoardToRedis } from '@/services/api/redis';
import {
  IoCalendarClear,
  IoHeart,
  IoRestaurant,
  IoCut,
  IoFastFood,
  IoGameController,
  IoLocation,
  IoEllipsisHorizontalCircleSharp,
} from 'react-icons/io5';
import { debugToRN } from '@/lib/utils';
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

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

// 🔹 GetFeedsResponse에 currentUserId만 추가한 타입
interface ArticleProps extends GetFeedsResponse {
  currentUserId?: number | null;
}

export default function Article({
  boardUser,
  content,
  createdAt,
  id,
  images,
  starRating,
  title,
  currentUserId,
  commentCount,
  category,
  likeCount,
}: ArticleProps) {
  const navigate = useNavigate();
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  // 🔹 내 게시글인지 여부
  const isOwner = !!currentUserId && !!boardUser?.id && boardUser.id === currentUserId;

  if (!id) return null; // id 없으면 방어적으로 렌더 안 함

  // 게시글 컴포넌트 반환
  return (
    <div className="w-80 inline-flex flex-col justify-start items-start flex-shrink-0 mb-4">
      <Card
        className="w-80 h-136 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.05)] border-gray-100 cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={() => {
          // 게시글 상세 페이지로 이동 시 게시글 데이터를 전달
          navigate(`/feed/${id}`, {
            state: {
              feed: {
                boardUser,
                content,
                createdAt,
                id,
                images,
                starRating,
                title,
                commentCount,
                likeCount,
              },
            },
          });
        }}
      >
        {/* 프로필 헤더 */}
        <CardHeader className="p-4 gap-4">
          <div className="flex items-start">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center">
                {/* 프로필 사진*/}
                {boardUser?.profileImg ? (
                  <img
                    className="w-10 h-10 rounded-full object-cover border-2 border-aqua-300"
                    src={`${IMAGE_BASE_URL}${boardUser.profileImg}`}
                    alt={boardUser.nickname}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full p-1.5 border-2 border-aqua-300 flex justify-center items-center">
                    <FaPaw className="w-10 h-10 text-aqua-300" />
                  </div>
                )}
                <div className="ml-3 flex flex-col">
                  {/* 프로필 이름, 게시글 생성 시간*/}
                  <div className="text-aqua-500 p2-b ">{boardUser?.nickname}</div>
                  <div className="text-aqua-500 p3">{formatRelativeTime(createdAt)}</div>
                </div>
              </div>
              {/* 🔹 내 글일 때만 ... 버튼 노출 */}
              {isOwner && (
                <button
                  type="button"
                  className="h-7 w-7 flex justify-center items-center cursor-pointer"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsActionModalOpen(true);
                  }}
                  aria-haspopup="dialog"
                  aria-expanded={isActionModalOpen}
                  aria-label="게시글 옵션 열기"
                >
                  <MoreHorizontal className="h-5 w-5 text-gray-300" />
                </button>
              )}
            </div>
          </div>

          {/* 게시물 내용 */}
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* 제목, 평점, 날짜 */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center">
                    <IconText
                      icon={
                        category === 'DAILY'
                          ? IoCalendarClear
                          : category === 'HEALTH'
                          ? IoHeart
                          : category === 'DINING'
                          ? IoRestaurant
                          : category === 'BEAUTY'
                          ? IoCut
                          : category === 'FOOD'
                          ? IoFastFood
                          : category === 'TOY'
                          ? IoGameController
                          : category === 'TRAVEL'
                          ? IoLocation
                          : IoEllipsisHorizontalCircleSharp
                      }
                      label={title}
                      size="md"
                      textStyle="h6-b"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="overflow-hidden text-ellipsis whitespace-nowrap max-w-full">{formatDate(createdAt)}</Badge>
                    <Badge variant="pink">
                      <FaStar className="text-pink-300 me-0.5" />
                      {typeof starRating === 'number' ? starRating.toFixed(1) : starRating}
                    </Badge>
                  </div>
                </div>

                {/* 본문 내용 */}
                <div className="h-15">
                  <div className="text-aqua-500 p2 line-clamp-3">{content}</div>
                </div>
              </div>

              {/* 대표 이미지 (첫 번째 이미지) */}
              {images && images.length > 0 && (
                <div className="w-full">
                  <div className="w-77 h-64 relative rounded-[12px] overflow-hidden">
                    <img className="w-77 h-64 rounded-[12px] object-cover" src={`${IMAGE_BASE_URL}${images[0]}`} alt={`${title} - 대표 이미지`} />
                  </div>
                </div>
              )}
            </div>

            {/* 액션 바 */}
            <div className="h-10 border-t border-gray-200 flex justify-between items-center pt-2">
              <div className="flex items-center">
                <button type="button" className="h-7 flex items-center gap-1 cursor-pointer hover:opacity-70">
                  <Heart className="h-5 w-5 text-pink-300" />
                  <span className="text-aqua-500 p2-b">{likeCount}</span>
                </button>
                <button type="button" className="h-7 flex items-center gap-1 ml-4 cursor-pointer hover:opacity-70">
                  <MessageCircle className="h-5 w-5 text-gray-600" />
                  <span className="ttext-aqua-500 p2-b">{commentCount}</span>
                </button>
              </div>
            </div>
          </CardContent>
        </CardHeader>
      </Card>

      {/* 게시글 수정 / 삭제 옵션 모달 */}
      {isActionModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsActionModalOpen(false)}
        >
          <div
            className="w-64 rounded-2xl bg-gray-100 p-4 shadow-lg"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-aqua-500 h6-b">게시글 관리</h3>
              <IoClose className="w-5 h-5 text-aqau-500 cursor-pointer" onClick={() => setIsActionModalOpen(false)} />
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                tone="aqua"
                shape="pillSolid"
                size="default"
                onClick={async (event) => {
                  event.stopPropagation();
                  setIsActionModalOpen(false);

                  if (!id) {
                    debugToRN('EDIT_CLICK_NO_ID', {});
                    return;
                  }

                  try {
                    debugToRN('EDIT_FLOW_START', { id });

                    const detail = await getFeedDetail(Number(id));
                    debugToRN('EDIT_FLOW_DETAIL_OK', {
                      id: detail?.id,
                      title: detail?.title,
                      hasImages: Array.isArray(detail?.images),
                    });

                    await saveBoardToRedis(detail);
                    debugToRN('EDIT_FLOW_REDIS_OK', {});

                    if ((window as any).ReactNativeWebView) {
                      const msg = JSON.stringify({ type: 'OPEN_FEED_EDIT' });
                      debugToRN('EDIT_FLOW_POSTMSG', { msg });
                      (window as any).ReactNativeWebView.postMessage(msg);
                    } else {
                      debugToRN('EDIT_FLOW_NO_RN_WEBVIEW', {});
                    }
                  } catch (e: any) {
                    debugToRN('EDIT_FLOW_ERROR', {
                      message: e?.message,
                      status: e?.response?.status,
                      data: e?.response?.data,
                    });
                    alert('수정 정보를 준비하는 데 실패했습니다.');
                  }
                }}
              >
                게시글 수정하기
              </Button>

              <Button
                type="button"
                tone="red"
                shape="pillSolid"
                size="default"
                onClick={async () => {
                  const confirmed = window.confirm('정말 게시글을 삭제하시겠습니까?\n삭제된 게시글은 복구할 수 없습니다.');
                  if (!confirmed) {
                    return;
                  }
                  setIsActionModalOpen(false);
                  try {
                    const response = await deleteFeed(Number(id));
                    console.log('게시글이 삭제되었습니다.', response);
                    window.location.reload();
                  } catch (error) {
                    console.error('게시글 삭제에 실패했습니다.', error);
                  }
                }}
              >
                게시글 삭제하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
