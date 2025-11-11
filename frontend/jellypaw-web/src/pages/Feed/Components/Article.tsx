// Article.tsx
import { useState, useEffect } from 'react';
import { MoreHorizontal, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MdRestaurant } from 'react-icons/md';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import IconText from '@/components/texts/IconText';
import { Badge } from '@/components/ui/badge';
import { FaStar } from 'react-icons/fa6';
import { FaPaw } from 'react-icons/fa';
import type { GetFeedsResponse } from '@/types/feed';
import { useNavigate } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { Button } from '@/components/ui/button';
import { deleteFeed } from '@/services/api/feed';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

// 🔹 GetFeedsResponse에 currentUserId만 추가한 타입
interface ArticleProps extends GetFeedsResponse {
  currentUserId?: number;
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
}: ArticleProps) {
  const navigate = useNavigate();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  // 🔹 내 게시글인지 여부
  const isOwner = !!currentUserId && !!boardUser?.id && boardUser.id === currentUserId;

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (!id) return null; // id 없으면 방어적으로 렌더 안 함

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
                  <div className="text-aqua-500 p2-b ">{boardUser?.nickname}</div>
                  <div className="text-aqua-500 p3">{createdAt}</div>
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
                    <IconText icon={MdRestaurant} label={title} size="md" textStyle="h6-b" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{createdAt}</Badge>
                    <Badge variant="pink">
                      <FaStar className="text-pink-300 me-0.5" />
                      {typeof starRating === 'number' ? starRating.toFixed(1) : starRating}
                    </Badge>
                  </div>
                </div>

                {/* 본문 */}
                <div className="h-15">
                  <div className="text-aqua-500 p2 line-clamp-3">{content}</div>
                </div>
              </div>

              {/* 이미지 슬라이더 */}
              <Carousel setApi={setApi} className="w-full relative">
                <CarouselContent>
                  {images?.map((url, idx) => (
                    <CarouselItem key={idx}>
                      <div className="w-77 h-64 relative rounded-[12px]">
                        <img
                          className="w-77 h-64 rounded-[12px] object-cover"
                          src={`${IMAGE_BASE_URL}${url}`}
                          alt={`${title} - 이미지 ${idx + 1}`}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* 인디케이터 */}
                {images && images.length > 1 && (
                  <div className="pt-3 flex justify-center">
                    <div className="flex gap-1">
                      {images.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full ${idx === current ? 'bg-aqua-300' : 'bg-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </Carousel>
            </div>

            {/* 액션 바 */}
            <div className="h-10 border-t border-gray-200 flex justify-between items-center pt-2">
              <div className="flex items-center">
                <button
                  type="button"
                  className="h-7 flex items-center gap-1 cursor-pointer hover:opacity-70"
                >
                  <Heart className="h-5 w-5" />
                  <span className="text-aqua-500 p2-b">{0}</span>
                </button>
                <button
                  type="button"
                  className="h-7 flex items-center gap-1 ml-4 cursor-pointer hover:opacity-70"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-aqua-500 p2-b">{0}</span>
                </button>
              </div>
              <button
                type="button"
                className="h-7 w-7 flex justify-center items-center cursor-pointer hover:opacity-70"
              >
                <Share2 className="h-5 w-5 text-aqua-500" />
              </button>
            </div>
          </CardContent>
        </CardHeader>
      </Card>

      {/* 🔹 내 글 + 모달 오픈 상태일 때만 */}
      {isOwner && isActionModalOpen && (
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
              <IoClose
                className="w-5 h-5 text-aqua-500 cursor-pointer"
                onClick={() => setIsActionModalOpen(false)}
              />
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
                  const confirmed = window.confirm(
                    '정말 게시글을 삭제하시겠습니까?\n삭제된 게시글은 복구할 수 없습니다.'
                  );
                  if (!confirmed) return;

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
