import BackHeader from '@/components/headers/BackHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import Comment from './Components/Comments';
import CommentInput from './Components/CommentInput';
import { getFeedDetail, getComments, deleteFeed, addLike, cancelLike, getLikedFeeds } from '@/services/api/feed';
import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { GetFeedDetailResponse, GetCommentsResponse } from '@/types/feed';
import type { SearchUsersResponse } from '@/types/search';
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
import { getFeeds } from '@/services/api/feed';
import { formatDate, formatRelativeTime } from '@/utils/timePassing';
import { motion } from 'framer-motion';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export default function FeedDetail() {
  const { boardId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: profileData } = useProfile();
  const feedFromState = (location.state as { feed?: GetFeedDetailResponse } | undefined)?.feed ?? null;
  const likeInfoFromState = (location.state as { isLiked?: boolean; currentLikeCount?: number } | undefined) ?? null;

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
  // 좋아요 상태
  const [isLiked, setIsLiked] = useState(likeInfoFromState?.isLiked ?? false);
  const [currentLikeCount, setCurrentLikeCount] = useState(likeInfoFromState?.currentLikeCount ?? detailData?.likeCount ?? 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  // 게시글 소유자 확인
  const isOwner = profileData?.userId === detailData?.boardUser?.id;

  // 좋아요 개수 초기화
  useEffect(() => {
    // state에서 받은 좋아요 정보가 있으면 우선 사용, 없으면 detailData 사용
    if (likeInfoFromState?.currentLikeCount !== undefined) {
      setCurrentLikeCount(likeInfoFromState.currentLikeCount);
    } else {
      setCurrentLikeCount(detailData?.likeCount ?? 0);
    }
  }, [detailData?.likeCount, likeInfoFromState?.currentLikeCount]);

  // 초기 좋아요 상태 확인
  useEffect(() => {
    // state에서 받은 좋아요 정보가 있으면 우선 사용
    if (likeInfoFromState?.isLiked !== undefined) {
      setIsLiked(likeInfoFromState.isLiked);
    } else if (detailData?.id) {
      // state에 정보가 없으면 API로 조회
      getLikedFeeds()
        .then((likedFeeds) => {
          const isLikedFeed = likedFeeds.some((likedFeed) => likedFeed.boardId === detailData.id);
          setIsLiked(isLikedFeed);
        })
        .catch((error) => {
          console.error('좋아요 상태 확인 실패:', error);
        });
    }
  }, [detailData?.id, likeInfoFromState?.isLiked]);

  useEffect(() => {
    const container = document.getElementById('app-scroll-container');
    if (!container) return;
    container.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  // 좋아요 토글 핸들러
  const handleLikeToggle = async () => {
    const boardId = detailData?.id;
    // id가 없거나 좋아요 로딩 중이면 좋아요 토글 안 함
    if (!boardId || isLikeLoading) return;

    // 이전 좋아요 상태와 좋아요 개수 저장
    const previousIsLiked = isLiked;
    const previousLikeCount = currentLikeCount;

    // 로컬 state만 즉시 업데이트 (UI 반영)
    setIsLiked(!previousIsLiked);
    if (previousIsLiked) {
      // 좋아요 취소: 1개 감소
      setCurrentLikeCount(Math.max(0, previousLikeCount - 1));
    } else {
      // 좋아요 추가: 1개 증가
      setCurrentLikeCount(previousLikeCount + 1);
    }

    // 좋아요 로딩 상태 업데이트
    setIsLikeLoading(true);

    // 좋아요 처리 (API 호출)
    try {
      // 이전 좋아요 상태가 true면 좋아요 취소, false면 좋아요 추가
      if (previousIsLiked) {
        await cancelLike(Number(boardId));
        console.log('좋아요 취소되었습니다.');
      } else {
        await addLike(Number(boardId));
        console.log('좋아요 추가되었습니다.');
      }
      // 실제 데이터는 Feed 전체 목록이 로드될 때 업데이트되므로 여기서는 API 호출만 수행
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

  // state로 받아온 게시글 정보 저장
  useEffect(() => {
    if (feedFromState) {
      setDetailData(feedFromState);
    }
  }, [feedFromState]);

  // 장소 정보 조회
  useEffect(() => {
    const placeId = detailData?.placeId;
    if (!placeId) {
      setPlaceDetail(null);
      return;
    }

    searchPlacesDetail(Number(placeId))
      .then((placeDetail) => {
        setPlaceDetail(placeDetail);
      })
      .catch((error) => {
        setPlaceDetail(null);
      });
  }, [detailData?.placeId]);

  // 댓글 조회
  useEffect(() => {
    if (!boardId) {
      return;
    }

    getComments(Number(boardId)).then((comments) => {
      setComments(comments);
      setReplyTargetId(null);
    });
  }, [boardId]);

  // 게시글 수정 시 데이터 다시 가져오기
  useEffect(() => {
    const handler = (event: any) => {
      const updatedId = event.detail?.boardId;
      if (!boardId) return;
      if (Number(updatedId) !== Number(boardId)) return;

      console.log('[WEB] FEED_UPDATED for this detail. refetching from list...');

      getFeeds()
        .then((feeds) => {
          const updated = feeds.find((feed) => feed.id === Number(boardId));
          if (!updated) {
            console.log('[WEB] updated feed not found in list');
            return;
          }

          setDetailData(updated as GetFeedDetailResponse);
        })
        .catch((error) => {
          console.error('[WEB] getFeeds after FEED_UPDATED failed', error);
        });
    };

    window.addEventListener('FEED_UPDATED', handler as any);
    return () => {
      window.removeEventListener('FEED_UPDATED', handler as any);
    };
  }, [boardId]);

  useEffect(() => {
    if (detailData || !boardId) return;

    (async () => {
      try {
        console.log('[WEB] no state feed, fetch list via getFeeds');
        const feeds = await getFeeds();
        const matched = feeds.find((f) => f.id === Number(boardId));

        if (!matched) {
          console.log('[WEB] feed not found in list for boardId', boardId);
          return;
        }

        setDetailData(matched as GetFeedDetailResponse);
      } catch (e) {
        console.error('[WEB] getFeeds in FeedDetail failed', e);
      }
    })();
  }, [detailData, boardId]);

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

  // 댓글 작성 성공 시 댓글 리스트 업데이트
  const handleCommentSubmitSuccess = (newComments: GetCommentsResponse[]) => {
    if (!newComments || !Array.isArray(newComments) || newComments.length === 0) {
      // response가 없거나 빈 배열이면 새로고침만 수행
      refreshComments();
      return;
    }

    // response로 받은 댓글 리스트로 교체
    setComments(newComments);
    // 댓글 수 업데이트
    setDetailData((prev) => (prev ? { ...prev, commentCount: newComments.length } : null));
    // 답글 대상 초기화
    setReplyTargetId(null);
    // 새로고침
    refreshComments();
  };

  // 답글 선택
  const handleReplySelect = (commentId: number | null) => {
    setReplyTargetId((prev) => (prev === commentId ? null : commentId));
  };

  // 캐러셀 슬라이드 제어
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

  return (
    <>
      {/* ✅ 페이지 전체 슬라이드 애니메이션은 여기만 */}
      <motion.div
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="min-h-screen bg-gray-100 pb-[72px]" // ✅ 댓글창 높이만큼 padding 추가
      >
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
                  console.log('detail: ', detailData);
                  if (detailData?.boardUser?.id && detailData?.boardUser?.nickname) {
                    // boardUser 정보를 SearchUsersResponse 형태로 변환
                    const searchResult: SearchUsersResponse = {
                      userId: detailData.boardUser.id,
                      nickname: detailData.boardUser.nickname,
                      profileImg: detailData.boardUser.profileImg ?? undefined,
                    };
                    navigate(`/search/person/${detailData.boardUser.id}`, {
                      state: { searchResult },
                    });
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
                  <div className="w-12 h-12 rounded-full p-1.5 border-2 border-gray-300 flex justify-center items-center">
                    <FaPaw className="w-12 h-12 text-gray-300" />
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
              {detailData?.starRating != 0 && (
                <Badge variant="pink">
                  <FaStar className="text-pink-300 me-0.5" />
                  {typeof detailData?.starRating === 'number' ? detailData.starRating.toFixed(1) : detailData?.starRating}
                </Badge>
              )}
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
              <span className="text-aqua-500 p2 whitespace-pre-line">{detailData?.content}</span>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <button type="button" className="h-7 flex items-center gap-1 cursor-pointer" onClick={handleLikeToggle} disabled={isLikeLoading}>
                  <Heart className={`h-5 w-5 ${isLiked ? 'text-pink-300 fill-pink-300' : 'text-pink-300'}`} />
                  <span className="text-aqua-500 p2-b">{currentLikeCount}</span>
                </button>
                <button type="button" className="h-7 flex items-center gap-1 ml-4 cursor-pointer ">
                  <MessageCircle className="h-5 w-5 text-gray-600" />
                  <span className="text-aqua-500 p2-b">{detailData?.commentCount}</span>
                </button>
              </div>
            </div>

            {/* 댓글 */}
            <div className="flex flex-col gap-4 mb-4">
              {comments
                .filter((comment): comment is GetCommentsResponse => !!comment && !!comment.userId)
                .map((comment, index) => (
                  <Comment key={index} {...comment} boardId={Number(boardId) || null} onReply={handleReplySelect} />
                ))}
            </div>
            {/* 댓글 입력창 */}
            {/* <CommentInput parentId={replyTargetId} onSubmitSuccess={handleCommentSubmitSuccess} onCancelReply={() => setReplyTargetId(null)} /> */}
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
      </motion.div>

      <CommentInput parentId={replyTargetId} onSubmitSuccess={handleCommentSubmitSuccess} onCancelReply={() => setReplyTargetId(null)} />
    </>
  );
}
