import { useState, useEffect, useMemo, useRef, useCallback, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers } from 'react-icons/fi';
import Header from '@/components/headers/Header';
import Followers from '@/pages/Feed/Components/Followers';
import Article from '@/pages/Feed/Components/Article';
import { getFollowers } from '@/services/api/followers';
import { useProfile } from '@/hooks/queries/ProfileQuery';
import type { GetFollowersResponse } from '@/types/followers';
import { getFeeds, getLikedFeeds } from '@/services/api/feed';
import type { GetFeedsResponse, GetLikedFeedsResponse } from '@/types/feed';

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

  const loadFeeds = useCallback(
    async (options?: { force?: boolean }) => {
      const force = options?.force ?? false;

      // 이미 한 번 불러온 적 있고, 강제 새로고침 아니면 → 캐시에서 복원
      if (!force && feedsLoadedOnce && feedsCache) {
        console.log('[Feed] use cached feeds');
        setFeeds(feedsCache);
        setIsFeedsLoaded(true);
        return;
      }

      try {
        const feeds = await getFeeds();
        console.log('feeds', feeds);
        const sortedFeeds = [...feeds].sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });

        // ⭐ 캐시에 보관
        feedsCache = sortedFeeds;
        feedsLoadedOnce = true;

        setFeeds(sortedFeeds);
      } catch (error) {
        console.error('게시글 조회 실패:', error);
        setFeeds([]);
      } finally {
        setIsFeedsLoaded(true);
      }
    },
    [],
  );

  // 최초 마운트 때만: 캐시 있으면 캐시, 없으면 API
  useEffect(() => {
  const hasScrollMemory =
    typeof window !== 'undefined' &&
    !!window.sessionStorage.getItem(FEED_SCROLL_KEY);

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

  const hasScrollMemory =
    typeof window !== 'undefined' &&
    !!window.sessionStorage.getItem(FEED_SCROLL_KEY);

  const isFollowingsDirty =
    typeof window !== 'undefined' &&
    window.sessionStorage.getItem(FOLLOWINGS_DIRTY_KEY) === '1';

  // 디테일 갔다가 바로 돌아온 케이스:
  // - 스크롤 메모리 있음
  // - 팔로잉 변경 플래그 없음
  // - 캐시 있음
  if (
    hasScrollMemory &&
    !isFollowingsDirty &&
    followingsLoadedOnce &&
    followingsCache
  ) {
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
  // 🔹 좋아요 상태 업데이트 핸들러
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
      const likedArticles = feeds.filter(
        (feed) => feed.id !== undefined && likedBoardIds.includes(feed.id),
      );
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

  // 🔹 맨 위에서 아래로 당기면 새로고침
  useEffect(() => {
    const container = document.getElementById('app-scroll-container');
    if (!container) return;

    let startY = 0;
    let isPulling = false;
    let pullingDistance = 0;
    const threshold = 60; // px

    const onTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
        pullingDistance = 0;
      } else {
        isPulling = false;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;
      const currentY = e.touches[0].clientY;
      pullingDistance = currentY - startY;

      if (pullingDistance < 0) {
        isPulling = false;
      }
    };

    const onTouchEnd = async () => {
      if (isPulling && pullingDistance > threshold && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await loadFeeds({ force: true });
          window.sessionStorage.setItem(FEED_SCROLL_KEY, '0');
          container.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        } finally {
          setIsRefreshing(false);
        }
      }
      isPulling = false;
      pullingDistance = 0;
    };

    container.addEventListener('touchstart', onTouchStart);
    container.addEventListener('touchmove', onTouchMove);
    container.addEventListener('touchend', onTouchEnd);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, [loadFeeds, isRefreshing]);

  return (
    <>
      <Header title="피드" />

      {/* ✅ 팔로워 + 게시글 영역을 한 번에 페이드 인 */}
      <div
        className="flex flex-col w-full"
        style={{
          opacity: isScrollReady ? 1 : 0,
          transition: 'opacity 120ms ease-out',
        }}
      >
        {/* 팔로워 목록 */}
        <div className="flex overflow-x-auto gap-4 w-full h-[100px] items-center scrollbar-hide">
          {/* 전체 */}
          <div
            className="w-16 h-20 flex flex-col gap-2 items-center cursor-pointer"
            onClick={() => handleProfileClick(null)}
          >
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
            <div
              className={`text-center p3-b ${
                activeProfileId === null ? 'text-aqua-300' : 'text-gray-300'
              }`}
            >
              전체
            </div>
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
            filteredFeeds.map((feed, index) => {
              const isLiked =
                feed.id !== undefined &&
                likedFeeds.some((likedFeed) => likedFeed.boardId === feed.id);
              return (
                <Article
                  key={index}
                  {...feed}
                  initialIsLiked={isLiked}
                  onLikeToggle={handleLikeToggle}
                  currentLikeCount={feed.likeCount ?? 0}
                />
              );
            })
          ) : activeProfileId !== null ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <p className="text-gray-400 p2-b text-center">게시글이 아직 없습니다</p>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
