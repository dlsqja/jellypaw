import { useState, useEffect, useMemo, useRef, useCallback, useLayoutEffect  } from 'react';
import { FiUsers } from 'react-icons/fi';
import Header from '@/components/headers/Header';
import Followers from '@/pages/Feed/Components/Followers';
import Article from '@/pages/Feed/Components/Article';
import { getFollowers } from '@/services/api/followers';
import { useProfile } from '@/hooks/queries/ProfileQuery';
import type { GetFollowersResponse } from '@/types/followers';
import { getFeeds, getLikedFeeds } from '@/services/api/feed';
import type { GetFeedsResponse, GetLikedFeedsResponse } from '@/types/feed';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export const FEED_SCROLL_KEY = 'feed-scroll-top';

export default function Feed() {
  const { data: profileData } = useProfile();
  const [followings, setFollowings] = useState<GetFollowersResponse[]>([]);
  const [feeds, setFeeds] = useState<GetFeedsResponse[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<number | null>(null);
  const [likedFeeds, setLikedFeeds] = useState<GetLikedFeedsResponse[]>([]);

  const restoredRef = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScrollReady, setIsScrollReady] = useState(false);

  const loadFeeds = useCallback(async () => {
    try {
      const feeds = await getFeeds();
      console.log('feeds', feeds);
      const sortedFeeds = [...feeds].sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      setFeeds(sortedFeeds);
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      setFeeds([]);
    }
  }, []);

  useEffect(() => {
    loadFeeds();
  }, [loadFeeds]);

  useLayoutEffect(() => {
  const container = document.getElementById('app-scroll-container');

  // 스크롤 컨테이너 자체가 없으면 그냥 보여만 주고 종료
  if (!container) {
    setIsScrollReady(true);
    return;
  }

  const raw = window.sessionStorage.getItem(FEED_SCROLL_KEY);
  const saved = raw ? Number(raw) : 0;

  if (feeds.length === 0) {
    setIsScrollReady(true);
    return;
  }

  if (!restoredRef.current) {
    if (!Number.isNaN(saved)) {
      container.scrollTo({ top: saved, left: 0, behavior: 'auto' });
    }
    restoredRef.current = true;
    setIsScrollReady(true);
  }
}, [feeds.length]);



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
    if (profileData?.nickname) {
      getFollowers(profileData.nickname).then((followers) => {
        console.log('followers', followers);
        setFollowings(followers || []);
      });
    }
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
        (feed) => feed.id !== undefined && likedBoardIds.includes(feed.id)
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
          await loadFeeds();
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
      <div className="flex flex-col items-center w-full mt-4 scrollbar-hide" style={{
          visibility: isScrollReady ? 'visible' : 'hidden',
        }}>
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
    </>
  );
}
