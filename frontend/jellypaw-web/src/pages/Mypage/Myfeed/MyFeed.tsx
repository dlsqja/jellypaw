import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ArticleBox from '../components/ArticleBox';
import { getMyFeed } from '@/services/api/mypage';
import type { GetMyFeedResponse } from '@/types/mypage';
import { useEffect } from 'react';

// 카테고리 라벨과 실제 카테고리 값 매핑
const categoryLabelToValue: Record<string, string[]> = {
  전체: [], // 전체는 빈 배열로, 모든 카테고리 포함
  일상: ['DAILY'],
  건강: ['HEALTH'],
  식당: ['DINING'],
  미용: ['BEAUTY'],
  음식: ['FOOD'],
  장난감: ['TOY'],
  여행: ['TRAVEL'],
  기타: ['ETC'],
};

const categoriesData = [
  { label: '전체' },
  { label: '일상' },
  { label: '건강' },
  { label: '식당' },
  { label: '미용' },
  { label: '음식' },
  { label: '장난감' },
  { label: '여행' },
  { label: '기타' },
];

export default function MyFeed() {
  const [myFeeds, setMyFeeds] = useState<GetMyFeedResponse['boards']>([]);

  useEffect(() => {
    getMyFeed()
      .then((response) => {
        console.log('내 게시글 조회 성공:', response);
        setMyFeeds(response.boards || []);
      })
      .catch((error) => {
        console.error('내 게시글 조회 실패:', error);
      });
  }, []);

  const [activeCategory, setActiveCategory] = useState<number>(0);

  const selectedCategoryLabel = categoriesData[activeCategory].label;
  const selectedCategoryValues = categoryLabelToValue[selectedCategoryLabel] || [];

  // 카테고리별 게시글 필터링 (useMemo로 최적화)
  const filteredArticles = useMemo(() => {
    if (!myFeeds || myFeeds.length === 0) {
      return [];
    }

    if (selectedCategoryLabel === '전체') {
      return myFeeds; // 전체는 모든 게시글 포함
    }

    // 선택된 카테고리 값들 중 하나와 일치하는 게시글만 필터링
    const filtered = myFeeds.filter((article) => {
      const articleCategory = article.category || '';
      const isMatch = selectedCategoryValues.includes(articleCategory);
      return isMatch;
    });

    return filtered;
  }, [myFeeds, selectedCategoryLabel, selectedCategoryValues]);

  // 카테고리별 게시글 수 계산
  const getCategoryCount = (categoryLabel: string) => {
    if (!myFeeds || myFeeds.length === 0) return 0;

    // 전체면 게시글 리스트 길이 반환
    if (categoryLabel === '전체') {
      return myFeeds.length;
    }

    // 카테고리 라벨에 해당하는 카테고리 값들 가져오기
    const categoryValues = categoryLabelToValue[categoryLabel] || [];

    // 해당 카테고리 값들 중 하나와 일치하는 게시글 수 반환
    return myFeeds.filter((article) => categoryValues.includes(article.category || '')).length;
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-aqua-500 h4-b">카테고리</p>
      <div className="grid grid-cols-3 gap-3">
        {categoriesData.map((category, index) => (
          <Button
            key={index}
            size="lg"
            shape={activeCategory === index ? 'solid' : 'outline'}
            tone={activeCategory === index ? 'aqua' : 'white'}
            borderTone="gray"
            className={`rounded-[16px] h-full ${activeCategory === index ? 'border-0' : 'border-2'}`}
            onClick={() => setActiveCategory(index)}
          >
            <div className="inline-flex flex-col items-center">
              <span className={`p2 ${activeCategory === index ? 'text-white' : 'text-gray-300'}`}>{category.label}</span>
              {/* 카테고리별 게시글 수 계산한 값으로 표시 */}
              <span className={`h4-b ${activeCategory === index ? 'text-white' : 'text-aqua-500'}`}>{getCategoryCount(category.label)}</span>
            </div>
          </Button>
        ))}
      </div>
      <p className="text-aqua-500 h4-b">{categoriesData[activeCategory].label} 게시글</p>
      {filteredArticles && filteredArticles.length > 0 ? (
        <div className="mb-4">
          <Card>
            <CardContent className="pt-4">
              {filteredArticles.map((article, index) => (
                <ArticleBox
                  key={index}
                  feed={article}
                  imageUrl={article.images?.[0] ?? ''}
                  title={article.title ?? ''}
                  date={article.createdAt ?? ''}
                  content={article.content ?? ''}
                  likeCount={article.likeCount ?? 0}
                  commentCount={article.commentCount ?? 0}
                  category={article.category}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="mb-4">
          <Card>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-300 p2-b text-center">{categoriesData[activeCategory].label} 게시글이 아직 없습니다</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
