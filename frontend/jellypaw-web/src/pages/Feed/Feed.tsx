import { useState } from 'react';
import Header from '@/components/headers/Header';
import Followers from '@/pages/Feed/Followers';

export default function Feed() {
  const petProfiles = [
    { name: '탄산', imageUrl: '/src/assets/pets/반려동물1.png' },
    { name: '구찌', imageUrl: '/src/assets/pets/반려동물2.png' },
    { name: '짜장', imageUrl: '/src/assets/pets/반려동물3.png' },
    { name: '햄찌', imageUrl: '/src/assets/pets/반려동물1.png' },
    { name: '림보', imageUrl: '/src/assets/pets/반려동물2.png' },
    { name: '뽕따', imageUrl: '/src/assets/pets/반려동물3.png' },
  ];

  const [activeProfile, setActiveProfile] = useState<string>('탄산');

  const handleProfileClick = (name: string) => {
    setActiveProfile(name);
  };

  return (
    <>
      <Header title="피드" />
      <div className="flex overflow-x-auto gap-4 p-4 w-full items-center">
        {petProfiles.map((petProfile) => (
          <Followers
            key={petProfile.name}
            imageUrl={petProfile.imageUrl || ''}
            name={petProfile.name}
            isActive={activeProfile === petProfile.name}
            onClick={() => handleProfileClick(petProfile.name)}
          />
        ))}
      </div>
    </>
  );
}
