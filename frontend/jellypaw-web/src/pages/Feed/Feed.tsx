import { useState } from 'react';
import Header from '@/components/headers/Header';
import Followers from '@/pages/Feed/Followers';
import { FiUsers } from 'react-icons/fi';
export default function Feed() {
  // 팔로워 목록
  const petProfiles = [
    { name: '탄산', imageUrl: '/src/assets/pets/반려동물1.png' },
    { name: '구찌', imageUrl: '/src/assets/pets/반려동물2.png' },
    { name: '짜장', imageUrl: '/src/assets/pets/반려동물3.png' },
    { name: '햄찌', imageUrl: '/src/assets/pets/반려동물1.png' },
    { name: '림보', imageUrl: '/src/assets/pets/반려동물2.png' },
    { name: '뽕따', imageUrl: '/src/assets/pets/반려동물3.png' },
  ];

  const [activeProfile, setActiveProfile] = useState<string>('전체');

  const handleProfileClick = (name: string) => {
    setActiveProfile(name);
  };

  return (
    <>
      <Header title="피드" />

      {/* 팔로워 목록 */}
      <div className="flex overflow-x-auto gap-4 w-full h-[95px] items-center scrollbar-hide">
        {/* 전체 */}
        <div className="w-16 h-20 flex flex-col gap-2 items-center cursor-pointer" onClick={() => setActiveProfile('전체')}>
          <div
            className="w-16 h-16 p-2 rounded-full outline outline-2 outline-offset-[-2px]
              outline-aqua-300 flex flex-col justify-center items-center"
          >
            <div className="w-12 h-12 bg-aqua-300 rounded-full inline-flex justify-center items-center">
              <FiUsers size={24} color="#ffffff" />
            </div>
          </div>
          <div className={`text-center p3-b ${activeProfile === '전체' ? 'text-aqua-300' : 'text-gray-300'}`}>전체</div>
        </div>
        {petProfiles.map((petProfile) => (
          <Followers
            key={petProfile.name}
            imageUrl={petProfile.imageUrl || ''}
            name={petProfile.name}
            isActive={activeProfile === petProfile.name}
            onClick={() => {
              setActiveProfile(petProfile.name);
              handleProfileClick(petProfile.name);
            }}
          />
        ))}
      </div>
    </>
  );
}
