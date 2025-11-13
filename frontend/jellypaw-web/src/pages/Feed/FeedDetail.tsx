import BackHeader from '@/components/headers/BackHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import Comment from './Components/Comments';
import CommentInput from './Components/CommentInput';
import { getFeedDetail, getComments, deleteFeed } from '@/services/api/feed';
import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { GetFeedDetailResponse, GetCommentsResponse } from '@/types/feed';
import { FaPaw } from 'react-icons/fa';
import { FaStar } from 'react-icons/fa6';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { searchPlacesDetail } from '@/services/api/search';
import type { SearchPlacesDetailResponse } from '@/types/search';
import { IoLocation, IoClose } from 'react-icons/io5';
import { useProfile } from '@/hooks/queries/ProfileQuery';
import { saveBoardToRedis } from '@/services/api/redis';
import { debugToRN } from '@/lib/utils';
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export default function FeedDetail() {
  const { boardId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: profileData } = useProfile();
  const feedFromState = (location.state as { feed?: GetFeedDetailResponse } | undefined)?.feed ?? null;

  // 게시글에서 가져온 데이터
  const [detailData, setDetailData] = useState<GetFeedDetailResponse | null>(feedFromState);
  // 댓글 데이터
  const [comments, setComments] = useState<GetCommentsResponse[]>([]);
  // 답글 대상 ID
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);
  // 캐러셀 API
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  // 현재 슬라이드
  const [currentSlide, setCurrentSlide] = useState(0);
  // 장소 정보
  const [placeDetail, setPlaceDetail] = useState<SearchPlacesDetailResponse | null>(null);
  // 모달 상태
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  // 게시글 소유자 확인
  const isOwner = profileData?.userId === detailData?.boardUser?.id;

  // 전달된 게시글 데이터가 있으면 그대로 사용, 없으면 백업으로 상세 조회
  useEffect(() => {
    if (feedFromState) {
      setDetailData(feedFromState);
      console.log('feedFromState:', feedFromState);
    } else if (boardId) {
      getFeedDetail(Number(boardId)).then((detail) => {
        console.log('getFeedDetail API 응답:', detail);
        console.log('getFeedDetail API 응답 placeId:', detail?.placeId);
        setDetailData(detail);
      });
    }
  }, [feedFromState, boardId]);

  // 장소 정보 조회
  useEffect(() => {
    const placeId = detailData?.placeId;
    if (!placeId) {
      setPlaceDetail(null);
      return;
    }

    console.log('장소 정보 조회 시작 (placeId):', placeId);
    searchPlacesDetail(Number(placeId))
      .then((placeDetail) => {
        console.log('장소 정보 조회 성공:', placeDetail);
        setPlaceDetail(placeDetail);
      })
      .catch((error) => {
        console.error('장소 정보 조회 실패:', error);
        setPlaceDetail(null);
      });
  }, [detailData?.placeId]);

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
      <Card className="rounded-none shadow-none border-none bg-gray-100 ">
        <CardHeader className="pb-2">
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
            {/* 🔹 내 글일 때만 ... 버튼 노출 */}
            {isOwner && (
              <button
                type="button"
                className="h-7 w-7 flex justify-center items-center cursor-pointer"
                onClick={() => {
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
        </CardHeader>

        {/* 댓글 입력창과의 간격을 위해 padding 추가 */}
        <CardContent className="flex flex-col gap-3">
          {/* 날짜 및 평점 */}
          <div className="flex items-center gap-2">
            <Badge className="overflow-hidden text-ellipsis whitespace-nowrap max-w-full">{formatDate(detailData?.createdAt)}</Badge>
            <Badge variant="pink">
              <FaStar className="text-pink-300 me-0.5" />
              {typeof detailData?.starRating === 'number' ? detailData.starRating.toFixed(1) : detailData?.starRating}
            </Badge>
          </div>

          {/* 장소 정보 */}
          {detailData?.placeId && placeDetail?.title && (
            <div className="flex items-center gap-1">
              <IoLocation className="h-3 w-3 text-aqua-600" />
              <span className="text-aqua-600 p3-b">{placeDetail.title}</span>
            </div>
          )}

          {/* 게시글 이미지 없으면  이미지 표시 안함 */}
          {detailData?.images && detailData.images.length > 0 ? (
            // 이미지가 1개면 이미지 표시
            detailData.images.length === 1 ? (
              <div className="w-full aspect-square relative rounded-[12px] overflow-hidden">
                <img className="w-full h-full rounded-[12px] object-cover" src={`${IMAGE_BASE_URL}${detailData.images[0]}`} alt="게시글 이미지" />
              </div>
            ) : (
              // 이미지가 여러개면 캐러셀 표시
              <Carousel className="w-full" setApi={setCarouselApi}>
                <CarouselContent>
                  {detailData.images.map((image, index) => (
                    <CarouselItem key={image ?? index}>
                      <div className="w-full aspect-square relative rounded-[12px] overflow-hidden">
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

          {/* 본문 */}
          <div className="flex flex-col">
            <p className="text-aqua-500 p1-b flex-shrink-0">{detailData?.title}</p>
            <span className="text-aqua-500 p2">{detailData?.content}</span>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button type="button" className="h-7 flex items-center gap-1 cursor-pointer ">
                <Heart className="h-5 w-5 text-pink-300" />
                <span className="text-aqua-500 p2-b">{detailData?.likeCount}</span>
              </button>
              <button type="button" className="h-7 flex items-center gap-1 ml-4 cursor-pointer ">
                <MessageCircle className="h-5 w-5 text-gray-600" />
                <span className="text-aqua-500 p2-b">{detailData?.commentCount}</span>
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
              <IoClose className="w-5 h-5 text-aqua-500 cursor-pointer" onClick={() => setIsActionModalOpen(false)} />
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

                  if (!detailData) {
                    debugToRN('EDIT_CLICK_NO_DETAIL', {});
                    alert('게시글 정보를 찾을 수 없습니다.');
                    return;
                  }

                  try {
                    debugToRN('EDIT_FLOW_START', { id: detailData.id });

                    const payload = {
                      id: detailData.id,
                      boardUser: detailData.boardUser,
                      title: detailData.title,
                      content: detailData.content,
                      placeId: detailData.placeId ?? null,
                      starRating: detailData.starRating ?? 0,
                      createdAt: detailData.createdAt ?? '',
                      images: detailData.images ?? [],
                      commentCount: detailData.commentCount ?? 0,
                      likeCount: detailData.likeCount ?? 0,
                      viewCount: detailData.viewCount ?? 0,
                      category: detailData.category ?? null,
                      visibility: detailData.visibility ?? null,

                      // 🔹 여기부터 place 매핑 (백엔드 PlaceResponse 기준)
                      place: placeDetail
                        ? {
                            id: placeDetail.id ?? undefined,
                            title: placeDetail.title ?? '',
                            address: placeDetail.address ?? '',
                            openingHours: placeDetail.openingHours ?? '',
                            phoneNumber: placeDetail.phoneNumber ?? '',
                            link: placeDetail.link ?? '',
                            userId: placeDetail.userid ?? undefined,
                            starRating: placeDetail.starRating ?? undefined,
                            postCount: placeDetail.postCount ?? undefined,
                            user: placeDetail.user ?? undefined,
                          }
                        : null,
                    };

                    debugToRN('EDIT_FLOW_DETAIL_OK', {
                      id: payload.id,
                      title: payload.title,
                      hasImages: Array.isArray(payload.images),
                    });

                    await saveBoardToRedis(payload);
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
                    if (!detailData?.id) {
                      alert('게시글 ID가 없습니다.');
                      return;
                    }
                    await deleteFeed(Number(detailData.id));
                    console.log('게시글이 삭제되었습니다.');
                    navigate('/feed');
                  } catch (error) {
                    console.error('게시글 삭제에 실패했습니다.', error);
                    alert('게시글 삭제에 실패했습니다.');
                  }
                }}
              >
                게시글 삭제하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
