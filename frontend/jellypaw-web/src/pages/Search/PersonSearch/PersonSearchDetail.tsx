import { useState, useEffect } from 'react';
import BackHeader from '@/components/headers/BackHeader';
import SearchProfile from './SearchProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ArticleBox from '@/pages/Mypage/components/ArticleBox';
import { useParams } from 'react-router-dom';
import { searchUsersDetail } from '@/services/api/search';
import type { SearchUsersDetailResponse } from '@/types/search';

// 카테고리 더미 데이터
const categoriesData = [
  { label: '전체' },
  { label: '병원' },
  { label: '건강' },
  { label: '미용' },
  { label: '카페' },
  { label: '식당' },
  { label: '미용' },
  { label: '카페' },
  { label: '기타' },
];

// 게시글 더미 데이터
const articlesData = [
  {
    articleId: 1,
    category: '전체',
    imageUrl: '/src/assets/articles/게시글 사진.png',
    title: '공원에서 즐거운 시간',
    date: '2024.01.15',
    content: '초코가 공원에서 신나게 뛰어노는 모습이에요! 날씨가 너무 좋아서 오랫동안 산책했어요.',
    likeCount: 124,
    commentCount: 18,
  },
  {
    articleId: 2,
    imageUrl: '/src/assets/articles/게시글 사진.png',
    category: '병원',
    title: '병원 견학 후기',
    date: '2024.01.10',
    content: '오늘 병원에 가서 건강 검진을 받았어요. 초코는 정말 착하게 잘 행동했답니다.',
    likeCount: 89,
    commentCount: 12,
  },
  {
    articleId: 3,
    category: '건강',
    imageUrl: '/src/assets/articles/게시글 사진.png',
    title: '건강 검진 후기',
    date: '2024.01.10',
    content: '오늘 건강 검진을 받았어요. 초코는 정말 착하게 잘 행동했답니다.',
    likeCount: 89,
    commentCount: 12,
  },
  {
    articleId: 4,
    category: '미용',
    imageUrl: '/src/assets/articles/게시글 사진.png',
    title: '미용 후기',
    date: '2024.01.10',
    content: '오늘 미용을 받았어요. 초코는 정말 착하게 잘 행동했답니다.',
    likeCount: 89,
    commentCount: 12,
  },
  {
    articleId: 5,
    category: '카페',
    imageUrl: '/src/assets/articles/게시글 사진.png',
    title: '카페 후기',
    date: '2024.01.10',
    content: '오늘 카페를 받았어요. 초코는 정말 착하게 잘 행동했답니다.',
    likeCount: 89,
    commentCount: 12,
  },
  {
    articleId: 6,
    category: '식당',
    imageUrl: '/src/assets/articles/게시글 사진.png',
    title: '식당 후기',
    date: '2024.01.10',
    content: '오늘 식당을 받았어요. 초코는 정말 착하게 잘 행동했답니다.',
    likeCount: 89,
    commentCount: 12,
  },
  {
    articleId: 7,
    category: '기타',
    imageUrl: '/src/assets/articles/게시글 사진.png',
    title: '기타 후기',
    date: '2024.01.10',
    content: '오늘 기타를 받았어요. 초코는 정말 착하게 잘 행동했답니다.',
    likeCount: 89,
    commentCount: 12,
  },
];

export default function PersonSearchDetail() {
  const { personId } = useParams();
  const [targetProfileData, setTargetProfileData] = useState<SearchUsersDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!personId) return;
    // personId를 숫자로 변환
    const targetUserId = Number(personId);
    // 로딩 상태 설정
    setIsLoading(true);
    // 프로필 조회
    console.log('targetUserId', targetUserId);
    searchUsersDetail(targetUserId)
      .then((response) => {
        // 프로필 데이터 설정
        console.log('targetProfileData', response);
        setTargetProfileData(response);
      })
      .catch((error) => {
        // 프로필 조회 실패 시 오류 로깅
        console.error('프로필 조회 실패:', error);
        setTargetProfileData(null);
      })
      .finally(() => {
        // 로딩 상태 초기화
        setIsLoading(false);
      });
  }, [personId]);

  const [activeCategory, setActiveCategory] = useState<number>(0);

  const selectedCategoryLabel = categoriesData[activeCategory].label;
  const filteredArticles = articlesData.filter((article) => (selectedCategoryLabel === '전체' ? true : article.category === selectedCategoryLabel));

  // 카테고리별 게시글 수 계산
  const getCategoryCount = (categoryLabel: string) => {
    // 전체면 게시글 리스트 길이 반환
    if (categoryLabel === '전체') {
      return articlesData.length;
    }
    // 카테고리별 게시글 수 반환
    return articlesData.filter((article) => article.category === categoryLabel).length;
  };

  return (
    <>
      <BackHeader title="" />
      {/* 프로필 */}
      <SearchProfile profileData={targetProfileData} isLoading={isLoading} targetUserId={personId ? Number(personId) : undefined} />
      {/* 카테고리 */}
      <div className="flex flex-col gap-4 pt-4">
        <p className="text-aqua-500 h4-b">카테고리</p>
        <div className="grid grid-cols-3 gap-3">
          {categoriesData.map((category, index) => (
            <Button
              key={index}
              size="lg"
              shape={activeCategory === index ? 'solid' : 'outline'}
              tone={activeCategory === index ? 'aqua' : 'white'}
              borderTone="gray"
              className={`rounded-[16px] py-2 h-full ${activeCategory === index ? 'border-0' : 'border-2'}`}
              onClick={() => setActiveCategory(index)}
            >
              <div className="inline-flex flex-col items-center">
                <span className={`h5 ${activeCategory === index ? 'text-white' : 'text-gray-300'}`}>{category.label}</span>
                {/* 카테고리별 게시글 수 계산한 값으로 표시 */}
                <span className={`h3-b ${activeCategory === index ? 'text-white' : 'text-aqua-500'}`}>{getCategoryCount(category.label)}</span>
              </div>
            </Button>
          ))}
        </div>
        {/* 게시글 */}
        <p className="text-aqua-500 h4-b">{categoriesData[activeCategory].label} 게시글</p>
        <div className="mb-4">
          <Card>
            <CardContent className="pt-4">
              {filteredArticles.map((article, index) => (
                <ArticleBox
                  key={index}
                  imageUrl={article.imageUrl}
                  title={article.title}
                  date={article.date}
                  content={article.content}
                  likeCount={article.likeCount}
                  commentCount={article.commentCount}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
