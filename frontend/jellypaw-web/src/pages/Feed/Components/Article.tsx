import { useState, useEffect } from 'react';
import { MoreHorizontal, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MdRestaurant } from 'react-icons/md';
import IconText from '@/components/texts/IconText';
import { Badge } from '@/components/ui/badge';
import { FaStar } from 'react-icons/fa6';
import { FaPaw } from 'react-icons/fa';
import type { GetFeedsResponse } from '@/types/feed';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { IoClose } from 'react-icons/io5';
import { deleteFeed } from '@/services/api/feed';
// 카테고리 아이콘
import { IoCalendarClear } from 'react-icons/io5'; // 일상
import { IoHeart } from 'react-icons/io5'; // 건강
import { IoRestaurant } from 'react-icons/io5'; // 식당
import { IoCut } from 'react-icons/io5'; // 미용
import { IoFastFood } from 'react-icons/io5'; // 음식
import { IoGameController } from 'react-icons/io5'; // 장난감
import { IoLocation } from 'react-icons/io5'; // 여행
import { IoEllipsisHorizontalCircleSharp } from 'react-icons/io5'; // 기타

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export default function Article({
  boardUser,
  likeCount,
  category,
  commentCount,
  content,
  createdAt,
  id,
  images,
  starRating,
  thumbnail,
  title,
  viewCount,
  visibility,
}: GetFeedsResponse) {
  const navigate = useNavigate();
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  // 뱃지 날짜 형식 변화
  // 날짜 형식을 "25.01.15" 형식으로 변환 ("2025-11-11 05:20:20" -> "25.11.11")
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    // 공백을 기준으로 split하여 날짜 부분만 추출
    const datePart = dateString.split(' ')[0];
    // "YYYY-MM-DD" 형식을 "YY.MM.DD" 형식으로 변환
    const [year, month, day] = datePart.split('-');
    if (year && month && day) {
      // 연도의 마지막 2자리만 사용
      const shortYear = year.slice(-2);
      return `${shortYear}.${month}.${day}`;
    }
    return datePart;
  };

  // 프로필 옆 날짜짜 표시 형식 변화
  // 상대 시간 표시 (예: "2시간 전", "3일 전")
  const formatRelativeTime = (dateString?: string): string => {
    if (!dateString) return '';

    try {
      // 날짜 문자열을 Date 객체로 변환
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();

      // 밀리초를 분으로 변환
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      // 1시간 미만이면 "N분 전"
      if (diffMinutes < 60) {
        return `${diffMinutes}분 전`;
      }

      // 1시간 이상이면 시간으로 변환
      const diffHours = Math.floor(diffMinutes / 60);

      // 오늘인지 확인 (같은 날인지 체크)
      const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

      // 오늘이고 24시간 미만이면 "N시간 전"
      if (isToday && diffHours < 24) {
        return `${diffHours}시간 전`;
      }

      // 하루 이상 지났으면 일수로 계산
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays < 1) {
        // 하루 미만이지만 오늘이 아니면 "오늘" (시간대 차이 등)
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
      return formatDate(dateString); // 오류 시 기본 형식으로 반환
    }
  };

  // 게시글 컴포넌트 반환
  return (
    <div className="w-80 inline-flex flex-col justify-start items-start flex-shrink-0 mb-4">
      <Card
        className="w-80 h-136 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.05)] border-gray-100 cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={() => {
          navigate(`/feed/${id}`);
        }}
      >
        {/* 프로필 헤더 */}
        <CardHeader className="p-4 gap-4">
          <div className="flex items-start">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center">
                {/* 프로필 사진 */}
                {boardUser?.profileImg ? (
                  <img className="w-10 h-10 rounded-full object-cover " src={`${IMAGE_BASE_URL}${boardUser.profileImg}`} alt={boardUser.nickname} />
                ) : (
                  <div className="w-10 h-10 rounded-full p-1.5 flex justify-center items-center">
                    <FaPaw className="w-10 h-10 text-aqua-300" />
                  </div>
                )}
                <div className="ml-3 flex flex-col">
                  {/* 프로필 이름, 게시글 생성 시간*/}
                  <div className="text-aqua-500 p2-b ">{boardUser?.nickname}</div>
                  <div className="text-aqua-500 p3">{formatRelativeTime(createdAt)}</div>
                </div>
              </div>
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
            </div>
          </div>
          {/* 게시물 내용 */}
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* 제목, 평점, 게시글 생성일*/}
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
                    <Badge className="w-30">{formatDate(createdAt)}</Badge>
                    <Badge variant="pink" className="overflow-hidden text-ellipsis whitespace-nowrap">
                      <FaStar className="text-pink-300 me-0.5"></FaStar> {typeof starRating === 'number' ? starRating.toFixed(1) : starRating}
                    </Badge>
                  </div>
                </div>

                {/* 본문 내용 */}
                <div className="h-15">
                  <div className="text-aqua-500 p2 line-clamp-3">{content}</div>
                </div>
              </div>

              {/* 썸네일 */}
              {thumbnail && (
                <div className="w-77 h-64  rounded-[12px] ">
                  <img className="w-77 h-64 rounded-[12px] object-cover" src={`${IMAGE_BASE_URL}${thumbnail}`} alt={`${title}`} />
                </div>
              )}
            </div>

            {/* 액션 바 */}
            <div className="h-10 border-t border-gray-200 flex justify-between items-center pt-2">
              <div className="flex items-center">
                <button type="button" className="h-7 flex items-center gap-1 cursor-pointer hover:opacity-70">
                  <Heart className="h-5 w-5 text-pink-300" />
                  <span className="text-aqua-500 p2-b">{likeCount ?? 0}</span>
                </button>
                <button type="button" className="h-7 flex items-center gap-1 ml-4 cursor-pointer hover:opacity-70">
                  <MessageCircle className="h-5 w-5 text-gray-600" />
                  <span className="ttext-aqua-500 p2-b">{commentCount ?? 0}</span>
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
                onClick={() => {
                  setIsActionModalOpen(false);
                  navigate(`/feed/${id}`);
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
