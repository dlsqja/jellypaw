import { useState, useEffect, useMemo, useRef, useCallback, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers } from 'react-icons/fi';
import Header from '@/components/headers/Header';
import Followers from '@/pages/Feed/Components/Followers';
import Article from '@/pages/Feed/Components/Article';
import { getFollowers } from '@/services/api/followers';
import { useProfile } from '@/hooks/queries/ProfileQuery';
import type { GetFollowersResponse } from '@/types/followers';
import { getBoardDevelop, getLikedFeeds } from '@/services/api/feed';
import type { GetFeedsResponse, GetLikedFeedsResponse } from '@/types/feed';
import { inApp } from '@/lib/appBridge';

let feedsCache: GetFeedsResponse[] | null = null;
let feedsLoadedOnce = false;

let followingsCache: GetFollowersResponse[] | null = null;
let followingsLoadedOnce = false;

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export const FEED_SCROLL_KEY = 'feed-scroll-top';
export const FOLLOWINGS_DIRTY_KEY = 'followings-dirty';

export default function Feed() {
  const navigate = useNavigate();
  const { data: profileData } = useProfile();
  const [followings, setFollowings] = useState<GetFollowersResponse[]>([]);
  const [feeds, setFeeds] = useState<GetFeedsResponse[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<number | null>(null);
  const [likedFeeds, setLikedFeeds] = useState<GetLikedFeedsResponse[]>([]);

  const restoredRef = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScrollReady, setIsScrollReady] = useState(false);
  const [isFeedsLoaded, setIsFeedsLoaded] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const isPullingRef = useRef(false); // ref로 변경하여 동기적으로 접근
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isLoadingMoreRef = useRef(false);

  // 초기 피드 로드 (첫 페이지)
  const loadFeeds = useCallback(async (options?: { force?: boolean }) => {
    const force = options?.force ?? false;

    // 이미 한 번 불러온 적 있고, 강제 새로고침 아니면 → 캐시에서 복원
    if (!force && feedsLoadedOnce && feedsCache) {
      console.log('[Feed] use cached feeds');
      setFeeds(feedsCache);
      setIsFeedsLoaded(true);
      return;
    }

    try {
      console.log('[Feed] Loading initial feeds (cursorId: null, cursorCreatedAt: null)');
      const response = await getBoardDevelop({
        cursorId: null,
        cursorCreatedAt: null,
      });
      
      const newFeeds = response.boards || [];
      console.log('[DevelopFeed] Initial feeds loaded:', newFeeds.length);

      // ⭐ 캐시에 보관
      feedsCache = newFeeds;
      feedsLoadedOnce = true;

      setFeeds(newFeeds);
      // 20개 이상이면 더 있을 가능성이 높음, 20개 미만이면 마지막 페이지일 수 있음
      setHasMore(newFeeds.length >= 20);
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      setFeeds([]);
      setHasMore(false);
    } finally {
      setIsFeedsLoaded(true);
    }
  }, []);

  // 다음 페이지 로드 (무한 스크롤)
  const loadMoreFeeds = useCallback(async () => {
    // 이미 로딩 중이거나 더 이상 불러올 데이터가 없으면 리턴
    if (isLoadingMoreRef.current || !hasMore || feeds.length === 0) {
      return;
    }

    // 마지막 게시글 정보 가져오기
    const lastFeed = feeds[feeds.length - 1];
    if (!lastFeed?.id || !lastFeed?.createdAt) {
      console.log('[Feed] Cannot load more: missing last feed data');
      setHasMore(false);
      return;
    }

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);

    try {
      console.log('[Feed] Loading more feeds (cursorId:', lastFeed.id, 'cursorCreatedAt:', lastFeed.createdAt, ')');
      const response = await getBoardDevelop({
        cursorId: lastFeed.id,
        cursorCreatedAt: lastFeed.createdAt,
      });

      const newFeeds = response.boards || [];
      console.log('[Feed] More feeds loaded:', newFeeds.length);

      if (newFeeds.length === 0) {
        // 더 이상 불러올 데이터가 없음
        setHasMore(false);
      } else {
        // 기존 피드에 추가
        setFeeds((prevFeeds) => {
          const updatedFeeds = [...prevFeeds, ...newFeeds];
          // 캐시도 업데이트
          feedsCache = updatedFeeds;
          return updatedFeeds;
        });
        
        // 20개 미만이면 더 이상 없을 가능성 높음
        if (newFeeds.length < 20) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('추가 게시글 조회 실패:', error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  }, [feeds, hasMore]);

  // 최초 마운트 때만: 캐시 있으면 캐시, 없으면 API
  useEffect(() => {
    const hasScrollMemory = typeof window !== 'undefined' && !!window.sessionStorage.getItem(FEED_SCROLL_KEY);

    loadFeeds({ force: !hasScrollMemory });
  }, [loadFeeds]);

  // ✅ 스크롤 복원 + 피드/팔로잉 영역 노출 타이밍 제어
  useLayoutEffect(() => {
    const container = document.getElementById('app-scroll-container');

    // 스크롤 컨테이너 자체가 없으면 그냥 바로 노출
    if (!container) {
      setIsScrollReady(true);
      return;
    }

    // 아직 피드 로딩 끝나기 전이면 아무것도 안 함 (화면도 안 보이게 유지)
    if (!isFeedsLoaded) {
      return;
    }

    // 피드가 아예 없을 때: 복원은 의미 없으니 바로 노출
    if (feeds.length === 0) {
      restoredRef.current = true;
      setIsScrollReady(true);
      return;
    }

    // 피드 있고, 아직 한 번도 복원 안 했을 때만 실행
    if (!restoredRef.current) {
      const raw = window.sessionStorage.getItem(FEED_SCROLL_KEY);
      const saved = raw ? Number(raw) : 0;

      if (!Number.isNaN(saved)) {
        container.scrollTo({ top: saved, left: 0, behavior: 'auto' });
      }

      restoredRef.current = true;
      setIsScrollReady(true);
    }
  }, [feeds.length, isFeedsLoaded]);

  useEffect(() => {
    getLikedFeeds()
      .then((likedFeedsData) => {
        console.log('likedFeeds', likedFeedsData);
        setLikedFeeds(likedFeedsData || []);
      })
      .catch((error) => {
        console.error('좋아요한 게시글 조회 실패:', error);
        setLikedFeeds([]);
      });
  }, []);

  useEffect(() => {
    if (!profileData?.nickname) return;

    const hasScrollMemory = typeof window !== 'undefined' && !!window.sessionStorage.getItem(FEED_SCROLL_KEY);

    const isFollowingsDirty = typeof window !== 'undefined' && window.sessionStorage.getItem(FOLLOWINGS_DIRTY_KEY) === '1';

    // 디테일 갔다가 바로 돌아온 케이스:
    // - 스크롤 메모리 있음
    // - 팔로잉 변경 플래그 없음
    // - 캐시 있음
    if (hasScrollMemory && !isFollowingsDirty && followingsLoadedOnce && followingsCache) {
      console.log('[Feed] use cached followings');
      setFollowings(followingsCache);
      return;
    }

    getFollowers(profileData.nickname)
      .then((followers) => {
        const safe = followers || [];

        followingsCache = safe;
        followingsLoadedOnce = true;
        setFollowings(safe);

        // 🔹 팔로잉 변경 플래그가 있었으면 한 번 쓰고 제거
        if (isFollowingsDirty && typeof window !== 'undefined') {
          window.sessionStorage.removeItem(FOLLOWINGS_DIRTY_KEY);
        }
      })
      .catch((error) => {
        console.error('팔로잉 조회 실패:', error);
        followingsCache = [];
        followingsLoadedOnce = true;
        setFollowings([]);
      });
  }, [profileData?.nickname]);

  const handleProfileClick = (userId: number | null) => {
    setActiveProfileId(userId);
  };
  // 좋아요 상태 업데이트 핸들러
  const handleLikeToggle = (boardId: number, isLiked: boolean) => {
    setLikedFeeds((prevLikedFeeds) => {
      if (isLiked) {
        if (!prevLikedFeeds.some((likedFeed) => likedFeed.boardId === boardId)) {
          return [...prevLikedFeeds, { boardId }];
        }
        return prevLikedFeeds;
      } else {
        return prevLikedFeeds.filter((likedFeed) => likedFeed.boardId !== boardId);
      }
    });
  };

  useEffect(() => {
    if (feeds.length > 0 && likedFeeds.length > 0) {
      const likedBoardIds = likedFeeds.map((likedFeed) => likedFeed.boardId);
      const likedArticles = feeds.filter((feed) => feed.id !== undefined && likedBoardIds.includes(feed.id));
      console.log('좋아요가 되어 있는 게시글 목록:', likedArticles);
    }
  }, [feeds, likedFeeds]);

  // 🔹 팔로워 필터링
  const filteredFeeds = useMemo(() => {
    if (!Array.isArray(feeds)) {
      return [];
    }
    if (activeProfileId === null) {
      return feeds;
    }
    return feeds.filter((feed) => feed.boardUser?.id === activeProfileId);
  }, [feeds, activeProfileId]);

  // 🔹 네이티브: FEED_SCROLL_TO_TOP → 스크롤 맨 위로
  useEffect(() => {
    const handler = () => {
      const container = document.getElementById('app-scroll-container');
      if (!container) return;
      container.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      window.sessionStorage.setItem(FEED_SCROLL_KEY, '0');
    };

    window.addEventListener('FEED_SCROLL_TO_TOP', handler as any);
    return () => {
      window.removeEventListener('FEED_SCROLL_TO_TOP', handler as any);
    };
  }, []);

  // 🔹 피드 탭 클릭 시 /feed로 네비게이션 (스크롤 복원)
  useEffect(() => {
    const handler = (event: CustomEvent<{ restoreScroll: boolean }>) => {
      const currentPath = window.location.pathname;
      if (currentPath !== '/feed' && currentPath !== '/feed/') {
        // /feed로 이동 (스크롤은 기존 로직으로 복원됨)
        navigate('/feed', { replace: false });
        console.log('[Feed] NAVIGATE_TO_FEED: navigating to /feed for scroll restoration');
      }
    };

    window.addEventListener('NAVIGATE_TO_FEED', handler as EventListener);
    return () => {
      window.removeEventListener('NAVIGATE_TO_FEED', handler as EventListener);
    };
  }, [navigate]);

  // 🔹 무한 스크롤: 스크롤이 하단 근처에 도달하면 다음 페이지 로드
  useEffect(() => {
    const container = document.getElementById('app-scroll-container');
    if (!container || !isFeedsLoaded) {
      return;
    }

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      
      // 하단에서 200px 이내에 도달하면 다음 페이지 로드
      const threshold = 200;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;

      if (isNearBottom && hasMore && !isLoadingMore && !isLoadingMoreRef.current) {
        console.log('[Feed] Near bottom, loading more feeds...');
        loadMoreFeeds();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isFeedsLoaded, hasMore, isLoadingMore, loadMoreFeeds]);

  // 🔹 맨 위에서 아래로 당기면 새로고침 (SNS 스타일)
  // Touch 이벤트 (모바일/WebView) + Mouse 이벤트 (데스크톱 브라우저 테스트용)
  useEffect(() => {
    const container = document.getElementById('app-scroll-container');
    if (!container) {
      console.log('[Feed] Pull-to-refresh: container not found');
      return;
    }

    console.log('[Feed] Pull-to-refresh: event listeners registered');

    let startY = 0;
    let pullingDistance = 0;
    const threshold = 80; // px - 새로고침 트리거 거리
    const maxPull = 120; // px - 최대 당길 수 있는 거리

    const handleStart = (clientY: number) => {
      const scrollTop = container.scrollTop;
      console.log('[Feed] Start - scrollTop:', scrollTop, 'isRefreshing:', isRefreshing);

      if (scrollTop === 0 && !isRefreshing) {
        startY = clientY;
        isPullingRef.current = true;
        pullingDistance = 0;
        setPullDistance(0);
        console.log('[Feed] Start - pull started, startY:', startY);
      } else {
        isPullingRef.current = false;
      }
    };

    const handleMove = (clientY: number, e?: Event) => {
      if (!isPullingRef.current || isRefreshing) return;

      const currentY = clientY;
      pullingDistance = Math.max(0, Math.min(currentY - startY, maxPull));
      setPullDistance(pullingDistance);

      console.log('[Feed] Move - pullingDistance:', pullingDistance);

      // 당기는 중일 때 스크롤 방지
      if (pullingDistance > 0 && e) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleEnd = async () => {
      console.log('[Feed] End - isPulling:', isPullingRef.current, 'pullingDistance:', pullingDistance);

      if (!isPullingRef.current) return;

      if (pullingDistance > threshold && !isRefreshing) {
        console.log('[Feed] End - triggering refresh');
        setIsRefreshing(true);
        setPullDistance(threshold); // 새로고침 중에는 threshold 위치 유지

        try {
          await loadFeeds({ force: true });
          // 팔로잉도 새로고침
          if (profileData?.nickname) {
            try {
              const followers = await getFollowers(profileData.nickname);
              setFollowings(followers || []);
              followingsCache = followers || [];
            } catch (error) {
              console.error('팔로잉 새로고침 실패:', error);
            }
          }
          window.sessionStorage.setItem(FEED_SCROLL_KEY, '0');
          container.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        // threshold 미만이면 원래 위치로 부드럽게 복귀
        console.log('[Feed] End - not enough distance, resetting');
        setPullDistance(0);
      }

      isPullingRef.current = false;
      pullingDistance = 0;
    };

    // Touch 이벤트 (모바일/WebView)
    const onTouchStart = (e: TouchEvent) => {
      handleStart(e.touches[0].clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      handleMove(e.touches[0].clientY, e);
    };

    const onTouchEnd = () => {
      handleEnd();
    };

    // Mouse 이벤트 (데스크톱 브라우저 테스트용)
    const onMouseDown = (e: MouseEvent) => {
      handleStart(e.clientY);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isPullingRef.current) {
        handleMove(e.clientY, e);
      }
    };

    const onMouseUp = () => {
      handleEnd();
    };

    // 이벤트 리스너 등록
    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd);

    // 마우스 이벤트는 WebView가 아닐 때만 등록 (데스크톱 브라우저 테스트용)
    // WebView에서는 Touch 이벤트만 사용하므로 불필요한 리스너 등록 방지
    const isWebView = inApp();
    if (!isWebView) {
      container.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);

      if (!isWebView) {
        container.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }
      console.log('[Feed] Pull-to-refresh: event listeners removed');
    };
  }, [loadFeeds, isRefreshing, profileData?.nickname]);

  // pull-to-refresh 시각적 피드백 계산
  const pullProgress = Math.min(pullDistance / 80, 1); // 0~1 사이 값
  const shouldTrigger = pullDistance >= 80;
  const refreshIndicatorOpacity = pullDistance > 0 || isRefreshing ? Math.min(pullDistance / 60, 1) : 0;

  return (
    <div className="relative w-full">
      <Header title="피드" />

      {/* Pull-to-Refresh 인디케이터 */}
      <div
        className="absolute top-16 left-0 right-0 flex items-center justify-center pointer-events-none z-10"
        style={{
          height: `${Math.max(pullDistance, isRefreshing ? 80 : 0)}px`,
          transform: `translateY(${Math.max(pullDistance - 80, 0)}px)`,
          transition: isRefreshing ? 'none' : 'transform 0.2s ease-out, height 0.2s ease-out',
          opacity: refreshIndicatorOpacity,
        }}
      >
        <div className="flex flex-col items-center gap-2">
          {isRefreshing ? (
            <>
              <div className="w-6 h-6 border-2 border-aqua-300 border-t-transparent rounded-full animate-spin" />
              <span className="text-aqua-500 p3-b">새로고침 중...</span>
            </>
          ) : (
            <>
              <div
                className="w-6 h-6 border-2 border-aqua-300 rounded-full flex items-center justify-center"
                style={{
                  transform: `rotate(${pullProgress * 180}deg)`,
                  transition: 'transform 0.2s ease-out',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={shouldTrigger ? 'text-aqua-500' : 'text-aqua-300'}>
                  <path d="M6 2V6L9 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className={`p3-b ${shouldTrigger ? 'text-aqua-500' : 'text-gray-400'}`} style={{ transition: 'color 0.2s ease-out' }}>
                {shouldTrigger ? '놓으면 새로고침' : '당겨서 새로고침'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ✅ 팔로워 + 게시글 영역을 한 번에 페이드 인 */}
      <div
        className="flex flex-col w-full relative"
        style={{
          opacity: isScrollReady ? 1 : 0,
          transform: `translateY(${Math.max(pullDistance, 0)}px)`,
          transition:
            pullDistance > 0 || isRefreshing ? 'transform 0.2s ease-out, opacity 120ms ease-out' : 'opacity 120ms ease-out, transform 0.3s ease-out',
        }}
      >
        {/* 팔로워 목록 */}
        <div className="flex overflow-x-auto gap-4 w-full h-[100px] items-center scrollbar-hide">
          {/* 전체 */}
          <div className="w-16 h-20 flex flex-col gap-2 items-center cursor-pointer" onClick={() => handleProfileClick(null)}>
            <div
              className={`w-16 h-16 p-1.5 rounded-full outline outline-2 outline-offset-[-2px] ${
                activeProfileId === null ? 'outline-aqua-300' : 'outline-gray-200'
              } flex flex-col justify-center items-center`}
            >
              <div
                className={`w-[52px] h-[52px] ${
                  activeProfileId === null ? 'bg-aqua-300' : 'bg-gray-200'
                } rounded-full inline-flex justify-center items-center`}
              >
                <FiUsers size={24} color="#ffffff" />
              </div>
            </div>
            <div className={`text-center p3-b ${activeProfileId === null ? 'text-aqua-300' : 'text-gray-300'}`}>전체</div>
          </div>
          {followings.length > 0 &&
            followings.map((following, index) => (
              <Followers
                key={following.userId ?? following.nickname ?? index}
                imageUrl={following.profileImg ? `${IMAGE_BASE_URL}${following.profileImg}` : null}
                name={following.nickname || ''}
                isActive={activeProfileId !== null && following.userId === activeProfileId}
                onClick={() => {
                  handleProfileClick(following.userId ?? null);
                }}
              />
            ))}
        </div>

        {/* 게시글 목록 */}
        <div className="flex flex-col items-center w-full mt-4 scrollbar-hide">
          {filteredFeeds.length > 0 ? (
            <>
              {filteredFeeds.map((feed, index) => {
                const isLiked = feed.id !== undefined && likedFeeds.some((likedFeed) => likedFeed.boardId === feed.id);
                return (
                  <Article key={feed.id ?? index} {...feed} initialIsLiked={isLiked} onLikeToggle={handleLikeToggle} currentLikeCount={feed.likeCount ?? 0} />
                );
              })}
              {/* 무한 스크롤 로딩 인디케이터 */}
              {isLoadingMore && (
                <div className="flex justify-center items-center py-8">
                  <div className="text-gray-400 p3">게시글을 불러오는 중...</div>
                </div>
              )}
              {/* 더 이상 불러올 데이터가 없을 때 */}
              {!hasMore && feeds.length > 0 && (
                <div className="flex justify-center items-center py-8">
                  <div className="text-gray-400 p3">모든 게시글을 불러왔습니다.</div>
                </div>
              )}
            </>
          ) : activeProfileId !== null ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <p className="text-gray-400 p2-b text-center">게시글이 아직 없습니다</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
