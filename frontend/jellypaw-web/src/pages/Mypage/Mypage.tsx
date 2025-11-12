import { useEffect, useState } from 'react';
import Header from '@/components/headers/Header';
import MyProfile from './MyProfile/MyProfile';
import TabNavbar from '@/components/TabNavbar';
import MyFeed from './Myfeed/MyFeed';
import MyReservation from './MyReservation/MyReservation';
import { IoSettingsOutline, IoClose } from 'react-icons/io5';
import { useProfile } from '@/hooks/queries/ProfileQuery';
import { FaPaw } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const tabs = [
  { id: 'feed', label: '피드' },
  { id: 'reservation', label: '예약 관리' },
];

export default function Mypage() {
  const [activeTab, setActiveTab] = useState('feed');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const { data: profileData } = useProfile();
  console.log('profileData', profileData);
  const navigate = useNavigate();

  useEffect(() => {
    if (isDrawerOpen) {
      setShowDrawer(true);
    } else {
      const timer = setTimeout(() => setShowDrawer(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isDrawerOpen]);

  return (
    <>
      <div className="relative">
        <div className="flex items-center justify-between">
          <Header title="내 공간" />
          <IoSettingsOutline size={20} color="#284542" className="cursor-pointer" onClick={() => setIsDrawerOpen(true)} aria-label="설정 열기" />
        </div>
        <div className="inline-flex flex-col gap-6">
          {/* 프로필 */}
          <MyProfile />
          {/* 탭 네비게이션 */}
          <TabNavbar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          {/* 탭에 따라 다른 페이지 랜더링 */}
          {activeTab === 'feed' && <MyFeed />}
          {activeTab === 'reservation' && <MyReservation />}
        </div>

        {/* 설정 사이드바 */}
        {showDrawer && (
          <div
            className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsDrawerOpen(false)}
          />
        )}

        {showDrawer && (
          <aside
  className={`fixed top-0 right-0 z-50 h-full
    w-[88vw] max-w-[320px] md:w-full md:max-w-[280px]
    overflow-y-auto bg-gray-100 p-4 shadow-[0_0_24px_rgba(0,0,0,0.15)]
    transition-transform duration-500 ease-in-out
    ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
  role="dialog"
  aria-modal="true"
  aria-labelledby="mypage-settings-title"
>

            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 id="mypage-settings-title" className="text-aqua-500 h5-b">
                설정
              </h2>
              <button type="button" onClick={() => setIsDrawerOpen(false)} aria-label="설정 닫기">
                <IoClose size={20} className="text-gray-400 hover:text-gray-500" />
              </button>
            </div>

            <div className="border-b border-gray-100 py-4">
              <div className="flex items-center gap-4">
                {profileData?.profileImg ? (
                  <img className="h-12 w-12 rounded-full object-cover" src={`${IMAGE_BASE_URL}${profileData.profileImg}`} alt="프로필" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-aqua-100">
                    <FaPaw className="h-8 w-8 text-aqua-300" />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-aqua-500 h6-b">{profileData?.nickname ?? '닉네임 없음'}</span>
                  {profileData?.description && <span className="text-gray-600 p2 line-clamp-2">{profileData.description}</span>}
                </div>
              </div>
            </div>

  <div className="flex flex-col gap-4 py-4 justify-center items-center">
<button
      type="button"
      className="text-left text-aqua-500 p2-b"
      onClick={() => {
        setIsDrawerOpen(false);
        setTimeout(() => navigate('/mypage/verify'), 300);
      }}
    >    인증 받기
  </button>

  <button type="button" className="text-left text-red-500 p2-b">
    로그아웃
  </button>
  <button type="button" className="text-left text-gray-300 p2">
    회원 탈퇴
  </button>
</div>

          </aside>
        )}
      </div>
    </>
  );
}
