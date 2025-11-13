import { Heart, MessageCircle } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';
import type { GetFeedsResponse } from '@/types/feed';
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

// 날짜 형식 파싱 함수 (YYYY-MM-DD HH:mm:ss -> YYYY-MM-DD)
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  // 공백으로 분리하여 날짜 부분만 추출
  const datePart = dateString.split(' ')[0];
  return datePart;
};

interface ArticleBoxProps {
  // 전체 게시글 데이터 (상세 페이지로 전달용)
  feed?: GetFeedsResponse;
  // 개별 props (하위 호환성을 위해 유지)
  imageUrl?: string;
  title: string;
  date: string;
  content: string;
  likeCount: number;
  commentCount: number;
  category?: string;
}

export default function ArticleBox({ feed, imageUrl, title, date, content, likeCount, commentCount, category }: ArticleBoxProps) {
  const navigate = useNavigate();

  // 게시글 상세 페이지로 이동
  const handleArticleClick = () => {
    if (feed?.id) {
      // feed 데이터를 state로 전달
      navigate(`/feed/${feed.id}`, {
        state: {
          feed: {
            boardUser: feed.boardUser,
            content: feed.content,
            createdAt: feed.createdAt,
            id: feed.id,
            images: feed.images,
            starRating: feed.starRating,
            title: feed.title,
            commentCount: feed.commentCount,
            likeCount: feed.likeCount,
            placeId: feed.placeId,
            category: feed.category,
            viewCount: feed.viewCount,
            visibility: feed.visibility,
          },
        },
      });
    }
  };
  // 카테고리 아이콘 렌더링 함수
  const renderCategoryIcon = () => {
    if (category === 'DAILY') {
      return <IoCalendarClear className="w-10 h-10 text-pink-200" />;
    } else if (category === 'HEALTH') {
      return <IoHeart className="w-10 h-10 text-pink-200" />;
    } else if (category === 'DINING') {
      return <IoRestaurant className="w-10 h-10 text-pink-200" />;
    } else if (category === 'BEAUTY') {
      return <IoCut className="w-10 h-10 text-pink-200" />;
    } else if (category === 'FOOD') {
      return <IoFastFood className="w-10 h-10 text-pink-200" />;
    } else if (category === 'TOY') {
      return <IoGameController className="w-10 h-10 text-pink-200" />;
    } else if (category === 'TRAVEL') {
      return <IoLocation className="w-10 h-10 text-pink-200" />;
    } else {
      return <IoEllipsisHorizontalCircleSharp className="w-12 h-12 text-pink-200" />;
    }
  };

  // feed가 있으면 클릭 가능하도록 설정
  const isClickable = feed?.id !== undefined;

  return (
    <div
      className={`px-4 pb-2 border-b border-gray-200 last:border-b-0 flex items-start gap-4 ${isClickable ? 'cursor-pointer' : ''}`}
      onClick={isClickable ? handleArticleClick : undefined}
    >
      {/* 이미지 또는 카테고리 아이콘 */}
      {imageUrl && imageUrl.trim() !== '' ? (
        <img className="w-20 h-20 rounded-lg object-cover flex-shrink-0" src={`${IMAGE_BASE_URL}${imageUrl}`} alt="article image" />
      ) : (
        <div className="w-20 h-20 rounded-lg bg-white-100 flex items-center justify-center flex-shrink-0">{renderCategoryIcon()}</div>
      )}
      <div className="flex-1 flex flex-col gap-1">
        {/* 제목 */}
        <div className="text-aqua-500 p2-b ">{title}</div>
        {/* 날짜 */}
        <div className="text-gray-300 caption1">{formatDate(date)}</div>
        {/* 본문 */}
        <div className="text-aqua-500 caption1 line-clamp-2">{content}</div>
        {/* 좋아요, 댓글 수 */}
        <div className="flex justify-end items-center">
          <div className="flex items-center">
            <button
              type="button"
              className="h-7 flex items-center gap-1 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                // 좋아요 버튼 클릭 시 처리 (추후 구현 가능)
              }}
            >
              <Heart className="h-3.5 w-3.5 text-gray-300" />
              <span className="text-aqua-500 caption1">{likeCount}</span>
            </button>
            <button
              type="button"
              className="h-7 flex items-center gap-1 ml-4 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                // 댓글 버튼 클릭 시 처리 (추후 구현 가능)
              }}
            >
              <MessageCircle className="h-3.5 w-3.5 text-gray-300" />
              <span className="text-aqua-500 caption1">{commentCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
