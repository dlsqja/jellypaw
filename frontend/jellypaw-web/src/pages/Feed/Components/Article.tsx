import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MdRestaurant } from 'react-icons/md';
import IconText from '@/components/texts/IconText';
import { FaPaw } from 'react-icons/fa';
import type { GetFeedsResponse } from '@/types/feed';
import { useNavigate } from 'react-router-dom';
import { addLike, cancelLike } from '@/services/api/feed';
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
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

import { formatDate, formatRelativeTime } from '@/utils/timePassing';

// GetFeedsResponse를 그대로 사용
interface ArticleProps extends GetFeedsResponse {
  initialIsLiked?: boolean;
  onLikeToggle?: (boardId: number, isLiked: boolean) => void;
  currentLikeCount?: number;
}

export default function Article({
  boardUser,
  content,
  createdAt,
  id,
  images,
  starRating,
  title,
  commentCount,
  category,
  likeCount,
  placeId,
  visibility,
  initialIsLiked = false,
  onLikeToggle,
  currentLikeCount: propLikeCount,
}: ArticleProps) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [currentLikeCount, setCurrentLikeCount] = useState(propLikeCount ?? likeCount ?? 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  // 좋아요 개수 초기화
  useEffect(() => {
    setCurrentLikeCount(propLikeCount ?? likeCount ?? 0);
  }, [propLikeCount, likeCount]);

  // 초기 좋아요 상태 업데이트
  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);

  // 좋아요 토글 핸들러
  const handleLikeToggle = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // 카드 클릭 이벤트 방지
    // id가 없거나 좋아요 로딩 중이면 좋아요 토글 안 함
    if (!id || isLikeLoading) return;

    // 이전 좋아요 상태와 좋아요 개수 저장
    const previousIsLiked = isLiked;
    const previousLikeCount = currentLikeCount;

    // 좋아요 상태 업데이트
    setIsLiked(!previousIsLiked);
    setCurrentLikeCount(previousIsLiked ? Math.max(0, previousLikeCount - 1) : previousLikeCount + 1);

    // 좋아요 로딩 상태 업데이트
    setIsLikeLoading(true);

    // 좋아요 처리
    try {
      // 이전 좋아요 상태가 true면 좋아요 취소, false면 좋아요 추가
      if (previousIsLiked) {
        await cancelLike(Number(id));
        console.log('좋아요 취소되었습니다.');
        // 부모 컴포넌트에 좋아요 상태 업데이트 알림
        onLikeToggle?.(Number(id), false);
      } else {
        await addLike(Number(id));
        console.log('좋아요 추가되었습니다.');
        // 부모 컴포넌트에 좋아요 상태 업데이트 알림
        onLikeToggle?.(Number(id), true);
      }
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      // 에러 발생 시 롤백
      setIsLiked(previousIsLiked);
      setCurrentLikeCount(previousLikeCount);
      alert('좋아요 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLikeLoading(false);
    }
  };

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
                likeCount: currentLikeCount,
                placeId,
                category,
                visibility,
              },
              isLiked: isLiked,
              currentLikeCount: currentLikeCount,
            },
          });
        }}
      >
        {/* 프로필 헤더 */}
        <CardHeader className="p-4 gap-2">
          <div className="flex items-start">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center">
                {/* 프로필 사진*/}
                {boardUser?.profileImg ? (
                  <img
                    className="w-10 h-10 rounded-full object-cover border-2 "
                    src={`${IMAGE_BASE_URL}${boardUser.profileImg}`}
                    alt={boardUser.nickname}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full p-1.5 border-2 border-gray-300 flex justify-center items-center">
                    <FaPaw className="w-10 h-10 text-gray-300" />
                  </div>
                )}
                <div className="ml-3 flex flex-col">
                  {/* 프로필 이름, 게시글 생성 시간*/}
                  <div className="text-aqua-500 p2-b ">{boardUser?.nickname}</div>
                  <div className="text-aqua-500 p3">{formatRelativeTime(createdAt)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 게시물 내용 */}
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* 제목, 평점, 날짜 */}
              <div className="flex flex-col gap-1">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-1.5">
                    {/* 카테고리 아이콘 버튼 */}

                    {category === 'DAILY' ? (
                      <IoCalendarClear className="w-4 h-4 text-pink-300" />
                    ) : category === 'HEALTH' ? (
                      <IoHeart className="w-4 h-4 text-pink-300" />
                    ) : category === 'DINING' ? (
                      <IoRestaurant className="w-4 h-4 text-pink-300" />
                    ) : category === 'BEAUTY' ? (
                      <IoCut className="w-4 h-4 text-pink-300" />
                    ) : category === 'FOOD' ? (
                      <IoFastFood className="w-4 h-4 text-pink-300" />
                    ) : category === 'TOY' ? (
                      <IoGameController className="w-4 h-4 text-pink-300" />
                    ) : category === 'TRAVEL' ? (
                      <IoLocation className="w-4 h-4 text-pink-300" />
                    ) : (
                      <IoEllipsisHorizontalCircleSharp className="w-6 h-6 text-pink-300" />
                    )}

                    {/* 제목 */}
                    <p className="text-aqua-500 h6-b flex-1">{title}</p>
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
                  <div className="w-full aspect-square relative rounded-[12px] overflow-hidden">
                    <img className="w-full h-full rounded-[12px] object-cover" src={`${IMAGE_BASE_URL}${images[0]}`} alt={`${title} - 대표 이미지`} />
                  </div>
                </div>
              )}
            </div>

            {/* 액션 바 */}
            <div className="h-10 border-t border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <button
                  type="button"
                  className="h-7 flex items-center gap-1 cursor-pointer hover:opacity-70 disabled:opacity-50"
                  onClick={handleLikeToggle}
                  disabled={isLikeLoading}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'text-pink-400' : 'text-pink-300'}`} fill={isLiked ? 'currentColor' : 'none'} />
                  <span className="text-aqua-500 p2-b">{currentLikeCount}</span>
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
    </div>
  );
}
