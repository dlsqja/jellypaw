import { useState } from 'react';
import Header from '@/components/headers/Header';
import MyProfile from './MyProfile/MyProfile';
import TabNavbar from '@/components/TabNavbar';
import MyFeed from './Myfeed/MyFeed';
import MyReservation from './MyReservation/MyReservation';

const tabs = [
  { id: 'feed', label: '피드' },
  { id: 'reservation', label: '예약 관리' },
];

export default function Mypage() {
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <>
      <div className="flex items-center justify-between">
        <Header title="내 공간" />
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
    </>
  );
}
