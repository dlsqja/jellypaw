import { useState } from 'react';
import { FiUsers } from 'react-icons/fi';
import Header from '@/components/headers/Header';
import Followers from '@/pages/Feed/Components/Followers';
import Article from '@/pages/Feed/Components/Article';

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

  // 게시글 더미 데이터
  const articles = [
    {
      name: '탄산',
      imageUrl: '/src/assets/pets/반려동물1.png',
      createdAt: '2시간 전',
      content:
        '아주 맛있군! 탄산이가 정말 좋아하는 연어와 고구마를 섞어서 만든 수제 사료예요. 두 줄까지만 보이고 나머지 더보기더보기더보기더비고디보기더보기더보기더비고디...',
      imageUrls: ['/src/assets/articles/게시글 사진.png', '/src/assets/articles/게시글 사진.png', '/src/assets/articles/게시글 사진.png'],
      title: '탄산이 오늘 먹은 것',
      rating: 5.0,
      date: '24.01.15',
      likeCount: 10,
      commentCount: 10,
    },
    {
      name: '구찌',
      imageUrl: '/src/assets/pets/반려동물2.png',
      createdAt: '5시간 전',
      content: '구찌가 오늘 산책하면서 정말 즐거워했어요! 새로 만난 친구와도 잘 어울렸고 나무도 열심히 탐색했답니다.',
      imageUrls: ['/src/assets/articles/게시글 사진.png', '/src/assets/articles/게시글 사진.png'],
      title: '오늘의 산책',
      rating: 4.5,
      date: '24.01.15',
      likeCount: 25,
      commentCount: 8,
    },
    {
      name: '짜장',
      imageUrl: '/src/assets/pets/반려동물3.png',
      createdAt: '1일 전',
      content: '짜장이가 요즘 새 장난감을 좋아해요. 계속 가지고 다니면서 놀고 있네요. 귀여워서 못 견디겠어요!',
      imageUrls: ['/src/assets/articles/게시글 사진.png'],
      title: '새 장난감',
      rating: 5.0,
      date: '24.01.14',
      likeCount: 15,
      commentCount: 5,
    },
  ];

  return (
    <>
      <Header title="피드" />

      {/* 팔로워 목록 */}
      <div className="flex overflow-x-auto gap-4 w-full h-[95px] items-center scrollbar-hide">
        {/* 전체 */}
        <div className="w-16 h-20 flex flex-col gap-2 items-center cursor-pointer" onClick={() => setActiveProfile('전체')}>
          <div
            className="w-16 h-16 p-1.5 rounded-full outline outline-2 outline-offset-[-2px]
              outline-aqua-300 flex flex-col justify-center items-center"
          >
            <div className="w-[52px] h-[52px] bg-aqua-300 rounded-full inline-flex justify-center items-center">
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

      {/* 게시글 목록 */}
      <div className="flex flex-col items-center gap-4 w-full mt-4 scrollbar-hide">
        {articles.map((article, index) => (
          <Article
            key={index}
            name={article.name}
            imageUrl={article.imageUrl}
            createdAt={article.createdAt}
            content={article.content}
            imageUrls={article.imageUrls}
            title={article.title}
            rating={article.rating}
            date={article.date}
            likeCount={article.likeCount}
            commentCount={article.commentCount}
          />
        ))}
      </div>
    </>
  );
}
