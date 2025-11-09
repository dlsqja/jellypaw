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

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export default function Article({ boardUser, content, createdAt, id, images, starRating, title }: GetFeedsResponse) {
  const navigate = useNavigate();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
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
                  <div className="text-aqua-500 p3">{createdAt}</div>
                </div>
              </div>
              {/* ... */}
              <button type="button" className="h-7 w-7 flex justify-center items-center cursor-pointer">
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
                    <IconText icon={MdRestaurant} label={title} size="md" textStyle="h6-b" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{createdAt}</Badge>
                    <Badge variant="pink">
                      <FaStar className="text-pink-300 me-0.5"></FaStar> {typeof starRating === 'number' ? starRating.toFixed(1) : starRating}
                    </Badge>
                  </div>
                </div>

                {/* 본문 내용 */}
                <div className="h-15">
                  <div className="text-aqua-500 p2 line-clamp-3">{content}</div>
                </div>
              </div>

              {/* 이미지 슬라이더 - carousel 사용 */}
              <Carousel setApi={setApi} className="w-full relative">
                <CarouselContent>
                  {images &&
                    images.map((url, index) => (
                      <CarouselItem key={index}>
                        <div className="w-77 h-64 relative rounded-[12px]">
                          <img
                            className="w-77 h-64 rounded-[12px] object-cover"
                            src={`${IMAGE_BASE_URL}${url}`}
                            alt={`${title} - 이미지 ${index + 1}`}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                </CarouselContent>
                {/* 이미지 인디케이터 */}
                {images && images.length > 1 && (
                  <div className="pt-3 flex justify-center">
                    <div className="flex gap-1">
                      {images &&
                        images.map((_, index) => (
                          <div key={index} className={`w-2 h-2 rounded-full ${index === current ? 'bg-aqua-300' : 'bg-gray-300'}`} />
                        ))}
                    </div>
                  </div>
                )}
              </Carousel>
            </div>

            {/* 액션 바 */}
            <div className="h-10 border-t border-gray-200 flex justify-between items-center pt-2">
              <div className="flex items-center">
                <button type="button" className="h-7 flex items-center gap-1 cursor-pointer hover:opacity-70">
                  <Heart className="h-5 w-5 text-pink-300" />
                  <span className="text-aqua-500 p2-b">{0}</span>
                </button>
                <button type="button" className="h-7 flex items-center gap-1 ml-4 cursor-pointer hover:opacity-70">
                  <MessageCircle className="h-5 w-5 text-gray-600" />
                  <span className="ttext-aqua-500 p2-b">{0}</span>
                </button>
              </div>
              <button type="button" className="h-7 w-7 flex justify-center items-center cursor-pointer hover:opacity-70">
                <Share2 className="h-5 w-5 text-aqua-500" />
              </button>
            </div>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
}
