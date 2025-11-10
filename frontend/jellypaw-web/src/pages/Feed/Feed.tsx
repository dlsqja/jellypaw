import { useState, useEffect } from 'react';
import { FiUsers } from 'react-icons/fi';
import Header from '@/components/headers/Header';
import Followers from '@/pages/Feed/Components/Followers';
import Article from '@/pages/Feed/Components/Article';
import { getFollowers } from '@/services/api/followers';
import { useProfile } from '@/hooks/queries/ProfileQuery';
import type { GetFollowersResponse } from '@/types/followers';
import { getFeeds } from '@/services/api/feed';
import type { GetFeedsResponse } from '@/types/feed';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export default function Feed() {
  const { data: profileData } = useProfile();
  const [followings, setFollowings] = useState<GetFollowersResponse[]>([]);
  const [feeds, setFeeds] = useState<GetFeedsResponse[]>([]);
  useEffect(() => {
    // profileData가 로드되고 nickname이 있을 때만 API 호출
    if (profileData?.nickname) {
      getFollowers(profileData.nickname).then((followers) => {
        console.log('followers', followers);
        setFollowings(followers || []); // null이면 빈 배열로 설정
      });
    }
  }, [profileData?.nickname]); // profileData.nickname이 변경될 때마다 실행

  // 팔로워 활성화 상태
  const [activeProfile, setActiveProfile] = useState<string>('전체');

  // 팔로워 클릭 핸들러
  const handleProfileClick = (name: string) => {
    setActiveProfile(name);
  };

  // 게시글 목록 조회
  useEffect(() => {
    getFeeds().then((feeds) => {
      console.log('feeds', feeds);
      setFeeds(feeds || []);
    });
  }, []);

  return (
    <>
      <Header title="피드" />

      {/* 팔로워 목록 */}
      <div className="flex overflow-x-auto gap-4 w-full h-[95px] items-center scrollbar-hide">
        {/* 전체 */}
        <div className="w-16 h-20 flex flex-col gap-2 items-center cursor-pointer" onClick={() => setActiveProfile('전체')}>
          <div
            className={`w-16 h-16 p-1.5 rounded-full outline outline-2 outline-offset-[-2px] ${
              activeProfile === '전체' ? 'outline-aqua-300' : 'outline-gray-200'
            } flex flex-col justify-center items-center`}
          >
            <div
              className={`w-[52px] h-[52px] ${
                activeProfile === '전체' ? 'bg-aqua-300' : 'bg-gray-200'
              } rounded-full inline-flex justify-center items-center`}
            >
              <FiUsers size={24} color={activeProfile === '전체' ? '#ffffff' : '#ffffff'} />
            </div>
          </div>
          <div className={`text-center p3-b ${activeProfile === '전체' ? 'text-aqua-300' : 'text-gray-300'}`}>전체</div>
        </div>
        {followings.length > 0 &&
          followings.map((following) => (
            <Followers
              key={following.nickname || ''}
              imageUrl={following.profileImg ? `${IMAGE_BASE_URL}${following.profileImg}` : null}
              name={following.nickname || ''}
              isActive={activeProfile === following.nickname}
              onClick={() => {
                setActiveProfile(following.nickname || '');
                handleProfileClick(following.nickname || '');
              }}
            />
          ))}
      </div>

      {/* 게시글 목록 */}
      <div className="flex flex-col items-center gap-4 w-full mt-4 scrollbar-hide">
        {feeds.map((feed, index) => (
          <Article
            key={index}
            boardUser={feed.boardUser}
            content={feed.content}
            createdAt={feed.createdAt}
            id={feed.id}
            images={feed.images}
            starRating={feed.starRating}
            title={feed.title}
          />
        ))}
      </div>
    </>
  );
}
