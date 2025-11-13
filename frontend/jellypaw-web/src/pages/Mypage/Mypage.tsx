// src/pages/Mypage/Mypage.tsx
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
import { inApp, sendToApp, webOnlyLogout } from '@/lib/appBridge';
import { Button } from '@/components/ui/button';
import { getMyFeed } from '@/services/api/mypage';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const tabs = [
  { id: 'feed', label: '피드' },
  { id: 'reservation', label: '예약 관리' },
];

export default function Mypage() {
  const [activeTab, setActiveTab] = useState('feed');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false); // ← 추가
  const { data: profileData } = useProfile();
  const navigate = useNavigate();

  // 드로어 오픈 시 드로어 표시
  useEffect(() => {
    if (isDrawerOpen) setShowDrawer(true);
    else {
      const t = setTimeout(() => setShowDrawer(false), 300);
      return () => clearTimeout(t);
    }
  }, [isDrawerOpen]);

  // 로그아웃 확인 모달 표시
  const handleConfirmLogout = () => {
    setConfirmOpen(false);
    setIsDrawerOpen(false);

    if (inApp()) {
      // 앱에게 로그아웃 요청
      sendToApp({ type: 'LOGOUT_REQUEST' });
    } else {
      // 웹 단독일 때
      webOnlyLogout();
    }
  };

  // 내 게시글 조회
  useEffect(() => {
    getMyFeed().then((data) => {
      console.log(data);
    });
  }, []);

  return (
    <>
      <div className="relative">
        <div className="flex items-center justify-between">
          <Header title="내 공간" />
          <IoSettingsOutline size={20} color="#284542" className="cursor-pointer" onClick={() => setIsDrawerOpen(true)} aria-label="설정 열기" />
        </div>

        <div className="inline-flex flex-col gap-6">
          <MyProfile />
          <TabNavbar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          {activeTab === 'feed' && <MyFeed />}
          {activeTab === 'reservation' && <MyReservation />}
        </div>

        {/* overlay */}
        {showDrawer && (
          <div
            className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsDrawerOpen(false)}
          />
        )}

        {/* drawer */}
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
              {/* 로그아웃 → 모달 오픈 */}
              <button type="button" className="text-left text-red-500 p2-b" onClick={() => setConfirmOpen(true)}>
                로그아웃
              </button>

              <button type="button" className="text-left text-gray-300 p2">
                회원 탈퇴
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* ✅ 확인 모달 */}
      {confirmOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/40" onClick={() => setConfirmOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-[70] -translate-x-1/2 -translate-y-1/2 w-[86vw] max-w-[360px] rounded-2xl bg-white p-5 shadow-lg">
            <p className="h6-b text-gray-900 mb-2">로그아웃 하시겠어요?</p>
            <p className="p2 text-gray-500 mb-4">현재 계정에서 로그아웃됩니다.</p>
            <div className="flex gap-2">
              <Button shape="pillOutline" tone="lightAqua" className="flex-1 h-11" onClick={() => setConfirmOpen(false)}>
                취소
              </Button>

              <Button shape="pillOutline" tone="red" borderTone="pink" className="flex-1 h-11" onClick={handleConfirmLogout}>
                로그아웃
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
