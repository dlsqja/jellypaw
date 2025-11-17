import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import BackHeader from '@/components/headers/BackHeader';
import { getFollowers } from '@/services/api/followers';
import { getFollowing } from '@/services/api/followers';
import { follow, unfollow } from '@/services/api/followers';
import { useProfile } from '@/hooks/queries/ProfileQuery';
import type { GetFollowersResponse, GetFollowingResponse } from '@/types/followers';
import { FaPaw } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export default function FollowerList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: profileData } = useProfile();
  const [activeTab, setActiveTab] = useState<'following' | 'follower'>('follower');
  const [followingList, setFollowingList] = useState<GetFollowingResponse[]>([]);
  const [followerList, setFollowerList] = useState<GetFollowersResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 쿼리 파라미터로 초기 탭 설정
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'following' || type === 'follower') {
      setActiveTab(type);
    }
  }, [searchParams]);

  // 팔로워/팔로잉 목록 조회
  useEffect(() => {
    if (!profileData?.nickname) return;

    const nickname = profileData.nickname;

    const fetchData = async () => {
      setIsLoading(true);

      try {
        const followingData = await getFollowers(nickname);
        setFollowingList(followingData || []);
        const followerData = await getFollowing(nickname);
        setFollowerList(followerData || []);
        console.log('followingData', followingData);
        console.log('followerData', followerData);
      } catch (error) {
        console.error('목록 조회 실패:', error);
        if (activeTab === 'following') {
          setFollowingList([]);
        } else {
          setFollowerList([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [profileData?.nickname, activeTab]);

  // 탭 변경 핸들러
  const handleTabChange = (tab: 'following' | 'follower') => {
    setActiveTab(tab);
    setSearchParams({ type: tab });
  };

  // 팔로우/언팔로우 핸들러
  const handleFollowToggle = async (nickname: string, isFollowing: boolean, userId?: number, profileImg?: string) => {
    if (!nickname) return;

    // 이전 상태 저장 (에러 시 롤백용)
    const previousFollowingList = [...followingList];
    const previousFollowerList = [...followerList];

    try {
      if (isFollowing) {
        // 언팔로우
        await unfollow(nickname);
        // 팔로잉 목록에서 제거
        setFollowingList((prev) => prev.filter((user) => user.nickname !== nickname));
        // 팔로워 탭에서 보는 경우, 팔로워 목록에는 그대로 유지
      } else {
        // 팔로우
        await follow(nickname);
        // 팔로잉 목록에 추가
        if (userId && nickname) {
          setFollowingList((prev) => {
            // 이미 존재하는지 확인
            if (prev.some((user) => user.nickname === nickname)) {
              return prev;
            }
            return [...prev, { userId, nickname, profileImg }];
          });
        }
      }
    } catch (error) {
      console.error('팔로우/언팔로우 실패:', error);
      // 에러 발생 시 롤백
      setFollowingList(previousFollowingList);
      setFollowerList(previousFollowerList);
      alert('팔로우 처리에 실패했습니다.');
    }
  };

  // 프로필 클릭 핸들러
  const handleProfileClick = (userId?: number) => {
    if (userId) {
      navigate(`/search/person/${userId}`);
    }
  };

  const currentList = activeTab === 'following' ? followingList : followerList;
  const followingCount = followingList.length;
  const followerCount = followerList.length;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <BackHeader title="" to="/mypage" />

      {/* 탭 바 */}
      <div className="w-full flex border-b border-gray-200 bg-gray-100">
        <button
          type="button"
          className={`flex-1 py-3 text-center transition-colors ${
            activeTab === 'following' ? 'text-aqua-500 p2-b border-b-2 border-aqua-500' : 'text-gray-300 p2-b'
          }`}
          onClick={() => handleTabChange('following')}
        >
          팔로잉 {followingCount}
        </button>
        <button
          type="button"
          className={`flex-1 py-3 text-center transition-colors ${
            activeTab === 'follower' ? 'text-aqua-500 p2-b border-b-2 border-aqua-500' : 'text-gray-300 p2-b'
          }`}
          onClick={() => handleTabChange('follower')}
        >
          팔로워 {followerCount}
        </button>
      </div>

      {/* 사용자 목록 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-aqua-500 p2">로딩 중...</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-400 p2">{activeTab === 'following' ? '팔로잉' : '팔로워'} 목록이 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {currentList.map((user) => {
              const isFollowing = followingList.some((f) => f.nickname === user.nickname);
              return (
                <div key={user.userId || user.nickname} className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-100">
                  {/* 프로필 이미지 */}
                  <button type="button" onClick={() => handleProfileClick(user.userId)} className="flex-shrink-0 cursor-pointer">
                    {user.profileImg ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-white">
                        <img className="w-full h-full object-cover" src={`${IMAGE_BASE_URL}${user.profileImg}`} alt={user.nickname} />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full border border-white bg-gray-200 flex items-center justify-center">
                        <FaPaw className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </button>

                  {/* 사용자 정보 */}
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleProfileClick(user.userId)}
                        className="text-aqua-500 p2-b cursor-pointer hover:opacity-70"
                      >
                        {user.nickname}
                      </button>
                      {/* TODO: 비공개 계정 여부에 따라 자물쇠 아이콘 표시 */}
                      {/* <FaLock className="w-3 h-3 text-gray-400" /> */}
                    </div>
                    {/* TODO: 사용자 설명 표시 (API 응답에 description 필드가 있는 경우) */}
                    {/* <div className="text-gray-400 p3 line-clamp-1">{user.description}</div> */}
                  </div>

                  {/* 팔로우 버튼 */}
                  {user.userId !== profileData?.userId && (
                    <Button
                      size="sm"
                      shape={isFollowing ? 'outline' : 'solid'}
                      tone={isFollowing ? 'lightAqua' : 'aqua'}
                      borderTone={isFollowing ? 'default' : 'gray'}
                      className="flex-shrink-0"
                      onClick={() => handleFollowToggle(user.nickname || '', isFollowing, user.userId, user.profileImg)}
                    >
                      <span className={`p3 ${isFollowing ? 'text-aqua-300' : 'text-white'}`}>{isFollowing ? '팔로잉' : '팔로우'}</span>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
