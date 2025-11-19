import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import BackHeader from '@/components/headers/BackHeader';
import SearchProfile from './SearchProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ArticleBox from '@/pages/Mypage/components/ArticleBox';
import { searchUsersDetail } from '@/services/api/search';
import type { SearchUsersDetailResponse, SearchUsersResponse } from '@/types/search';
import { getUserFeeds } from '@/services/api/feed';
import type { GetUserFeedsResponse } from '@/types/feed';

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

// 카테고리 더미 데이터
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

export default function PersonSearchDetail() {
  const { personId } = useParams();
  const location = useLocation();
  const searchResult = (location.state as { searchResult?: SearchUsersResponse } | undefined)?.searchResult;

  // state로 전달된 검색 결과를 초기 데이터로 변환 (useMemo로 메모이제이션)
  const SearchResultData = useMemo<SearchUsersDetailResponse | null>(() => {
    if (!searchResult) return null;
    return {
      userId: searchResult.userId,
      nickname: searchResult.nickname,
      description: searchResult.description,
      profileImg: searchResult.profileImg,
      backgroundImg: searchResult.backgroundImg,
      followerNum: searchResult.follower,
      followingNum: searchResult.following,
    };
  }, [searchResult]);

  // 프로필 데이터
  const [targetProfileData, setTargetProfileData] = useState<SearchUsersDetailResponse | null>(SearchResultData);
  const [isLoading, setIsLoading] = useState(!SearchResultData); // 초기 데이터가 있으면 로딩 상태 false
  const [userFeeds, setUserFeeds] = useState<GetUserFeedsResponse | null>(null);

  // 프로필 조회 함수 (초기 로드용 - 로딩 상태 표시)
  const fetchProfile = useCallback(() => {
    if (!personId) return;

    // 초기 데이터가 없을 때만 로딩 상태 표시
    if (!SearchResultData) {
      setIsLoading(true);
    }

    // state로 받은 nickname 사용
    const nickname = SearchResultData?.nickname ?? '';
    if (!nickname) {
      console.error('닉네임이 없어 프로필을 조회할 수 없습니다.');
      setIsLoading(false);
      return;
    }

    searchUsersDetail(nickname)
      .then((response) => {
        setTargetProfileData(response);
        console.log('targetProfileData', response);
      })
      .catch((error) => {
        console.error('프로필 조회 실패:', error);
        // 에러 발생 시 초기 데이터 유지
        if (SearchResultData) {
          setTargetProfileData(SearchResultData);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [personId, SearchResultData]);

  // 해당 사용자의 게시글 조회
  useEffect(() => {
    if (!targetProfileData?.nickname) {
      return;
    }

    getUserFeeds(targetProfileData.nickname)
      .then((response) => {
        setUserFeeds(response);
      })
      .catch((error) => {
        console.error('게시글 조회 실패:', error);
        setUserFeeds(null);
      });
  }, [targetProfileData?.nickname]);

  // 프로필 갱신 함수 (백그라운드 갱신용 - 로딩 상태 표시 안 함)
  const refreshProfile = useCallback(() => {
    if (!targetProfileData?.nickname) return;

    // 로딩 상태 변경 없이 백그라운드에서 조회
    searchUsersDetail(targetProfileData?.nickname ?? '')
      .then((response) => {
        setTargetProfileData(response);
      })
      .catch((error) => {
        console.error('프로필 갱신 실패:', error);
        // 에러 발생해도 기존 데이터 유지
      });
  }, [targetProfileData?.nickname]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const [activeCategory, setActiveCategory] = useState<number>(0);

  const selectedCategoryLabel = categoriesData[activeCategory].label;
  const selectedCategoryValues = categoryLabelToValue[selectedCategoryLabel] || [];

  // 카테고리별 게시글 필터링 (useMemo로 최적화)
  const filteredArticles = useMemo(() => {
    if (!userFeeds?.boards) {
      return [];
    }

    if (selectedCategoryLabel === '전체') {
      return userFeeds.boards; // 전체는 모든 게시글 포함
    }

    // 선택된 카테고리 값들 중 하나와 일치하는 게시글만 필터링
    const filtered = userFeeds.boards.filter((article) => {
      const articleCategory = article.category || '';
      const isMatch = selectedCategoryValues.includes(articleCategory);
      if (!isMatch) {
      }
      return isMatch;
    });

    return filtered;
  }, [userFeeds?.boards, selectedCategoryLabel, selectedCategoryValues]);

  // 카테고리별 게시글 수 계산
  const getCategoryCount = (categoryLabel: string) => {
    if (!userFeeds?.boards) return 0;

    // 전체면 게시글 리스트 길이 반환
    if (categoryLabel === '전체') {
      return userFeeds.boards.length;
    }

    // 카테고리 라벨에 해당하는 카테고리 값들 가져오기
    const categoryValues = categoryLabelToValue[categoryLabel] || [];

    // 해당 카테고리 값들 중 하나와 일치하는 게시글 수 반환
    return userFeeds.boards.filter((article) => categoryValues.includes(article.category || '')).length;
  };

  return (
    <>
      <BackHeader title="" />
      {/* 프로필 */}
      <SearchProfile
        profileData={targetProfileData}
        isLoading={isLoading}
        targetUserId={personId ? Number(personId) : undefined}
        onProfileUpdate={refreshProfile}
      />
      {/* 카테고리 */}
      <div className="flex flex-col gap-4 mt-4">
        <p className="text-aqua-500 h4-b">카테고리</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
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
    </>
  );
}
