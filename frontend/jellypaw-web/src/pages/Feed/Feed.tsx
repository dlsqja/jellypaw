import { useState, useEffect, useMemo } from 'react';
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

const scrollMemory: Record<string, number> = {};

export default function Feed() {
  const { data: profileData } = useProfile();
  const [followings, setFollowings] = useState<GetFollowersResponse[]>([]);
  const [feeds, setFeeds] = useState<GetFeedsResponse[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<number | null>(null);
  const [likedFeeds, setLikedFeeds] = useState<GetLikedFeedsResponse[]>([]);

  useEffect(() => {
    const container = document.getElementById('app-scroll-container');
    if (!container) return;

    const saved = scrollMemory['/feed'] ?? 0;
    container.scrollTo({ top: saved, left: 0, behavior: 'auto' });

    const handleScroll = () => {
      scrollMemory['/feed'] = container.scrollTop;
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      scrollMemory['/feed'] = container.scrollTop;
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 좋아요한 게시글 조회
  useEffect(() => {
    // profileData가 로드되고 nickname이 있을 때만 API 호출
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

  // 팔로워 목록 조회
  useEffect(() => {
    // profileData가 로드되고 nickname이 있을 때만 API 호출
    if (profileData?.nickname) {
      getFollowers(profileData.nickname).then((followers) => {
        console.log('followers', followers);
        setFollowings(followers || []); // null이면 빈 배열로 설정
      });
    }
  }, [profileData?.nickname]); // profileData.nickname이 변경될 때마다 실행

  // 팔로워 클릭 핸들러 - 팔로워 프로필 클릭 시 활성화
  const handleProfileClick = (userId: number | null) => {
    setActiveProfileId(userId);
  };

  // 게시글 목록 조회
  useEffect(() => {
    getFeeds()
      .then((feeds) => {
        console.log('feeds', feeds);
        // createdAt 기준으로 최신순 정렬
        const sortedFeeds = [...feeds].sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          // 날짜 문자열을 Date 객체로 변환하여 비교
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          // 최신순 (내림차순)
          return dateB - dateA;
        });
        setFeeds(sortedFeeds);
      })
      .catch((error) => {
        console.error('게시글 조회 실패:', error);
        setFeeds([]);
      });
  }, []);

  // 좋아요가 되어 있는 게시글 목록 콘솔 출력
  useEffect(() => {
    if (feeds.length > 0 && likedFeeds.length > 0) {
      const likedBoardIds = likedFeeds.map((likedFeed) => likedFeed.boardId);
      const likedArticles = feeds.filter((feed) => feed.id !== undefined && likedBoardIds.includes(feed.id));
      console.log('좋아요가 되어 있는 게시글 목록:', likedArticles);
    }
  }, [feeds, likedFeeds]);

  // 좋아요 상태 업데이트 핸들러
  const handleLikeToggle = (boardId: number, isLiked: boolean) => {
    setLikedFeeds((prevLikedFeeds) => {
      if (isLiked) {
        // 좋아요 추가: boardId가 없으면 추가
        if (!prevLikedFeeds.some((likedFeed) => likedFeed.boardId === boardId)) {
          return [...prevLikedFeeds, { boardId }];
        }
        return prevLikedFeeds;
      } else {
        // 좋아요 취소: boardId 제거
        return prevLikedFeeds.filter((likedFeed) => likedFeed.boardId !== boardId);
      }
    });
  };

  // 팔로워 userId와 게시글의 boardUser.id가 일치하는 게시글 필터링
  const filteredFeeds = useMemo(() => {
    if (!Array.isArray(feeds)) {
      return [];
    }
    // activeProfileId가 null이면 전체 게시글 표시
    if (activeProfileId === null) {
      return feeds;
    }
    // 특정 팔로워의 게시글만 필터링
    return feeds.filter((feed) => feed.boardUser?.id === activeProfileId);
  }, [feeds, activeProfileId]);

  return (
    <>
      <Header title="피드" />
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
              <FiUsers size={24} color={activeProfileId === null ? '#ffffff' : '#ffffff'} />
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
      <div className="flex flex-col items-center  w-full mt-4 scrollbar-hide">
        {filteredFeeds.length > 0 ? (
          filteredFeeds.map((feed, index) => {
            // 좋아요한 게시글 목록에서 현재 게시글의 id가 있는지 확인
            const isLiked = feed.id !== undefined && likedFeeds.some((likedFeed) => likedFeed.boardId === feed.id);
            return <Article key={index} {...feed} initialIsLiked={isLiked} onLikeToggle={handleLikeToggle} currentLikeCount={feed.likeCount ?? 0} />;
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
