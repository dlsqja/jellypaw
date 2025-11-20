import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BackHeader from '@/components/headers/BackHeader';
import LocationProfile from './components/LocationProfile';
import LocationInfo from './components/LocationInfo';
import { searchPlacesDetail } from '@/services/api/search';
import { getPlaceFeeds } from '@/services/api/search';
import type { SearchPlacesDetailResponse, GetPlaceFeedsResponse } from '@/types/search';
import { Spinner } from '@/components/ui/spinner';
import ArticleBox from '@/pages/Mypage/components/ArticleBox';
import { Card, CardContent } from '@/components/ui/card';

export default function LocationSearchDetail() {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const [locationData, setLocationData] = useState<SearchPlacesDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [placeFeeds, setPlaceFeeds] = useState<GetPlaceFeedsResponse | null>(null);

  // 장소 상세 정보 조회
  useEffect(() => {
    if (!locationId) return;
    // 장소 id 조회
    const placeId = Number(locationId);
    setIsLoading(true);

    // 장소 상세 정보 조회
    searchPlacesDetail(placeId)
      .then((response) => {
        setLocationData(response);
        console.log('locationData', response);
      })
      .catch((error) => {
        console.error('장소 상세 조회 실패:', error);
        setLocationData(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [locationId]);

  // 게시글 목록 조회
  useEffect(() => {
    if (!locationData?.id) {
      return;
    }
    getPlaceFeeds(locationData.id).then((response) => {
      console.log('response', response);
      setPlaceFeeds(response);
    });
  }, [locationData?.id]);

  // 페이지 로드 시 스크롤을 맨 위로 이동 (피드 상세와 동일한 로직)
  useEffect(() => {
    const container = document.getElementById('app-scroll-container');
    if (!container) return;
    container.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  console.log('placeFeeds', placeFeeds);
  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <>
        <BackHeader 
          title="" 
          onBack={() => {
            navigate('/search', { state: { fromDetail: true } });
          }}
        />
        <div className="flex flex-col justify-center items-center gap-4 py-8">
          <Spinner className="size-8 text-aqua-500" />
          <span className="text-gray-300 p2-b">장소 정보를 불러오는 중...</span>
        </div>
      </>
    );
  }

  // 데이터가 없을 때 표시
  if (!locationData) {
    return (
      <>
        <BackHeader 
          title="" 
          onBack={() => {
            navigate('/search', { state: { fromDetail: true } });
          }}
        />
        <div className="flex flex-col justify-center items-center gap-4 py-8">
          <p className="text-gray-300 p2-b">장소 정보를 불러올 수 없습니다.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <BackHeader 
        title="" 
        onBack={() => {
          navigate('/search', { state: { fromDetail: true } });
        }}
      />
      <div className="flex flex-col gap-4 mb-4">
        {/* 장소 프로필 , 기능 목록, 기본 정보, 인증직원(존재할 때만)*/}
        <LocationProfile {...locationData} />
        {/* 운영시간, 소개 글 */}
        <LocationInfo openingHours={locationData.openingHours || ''} />
        {/* 관련 게시글 목록 */}
        <p className="text-aqua-500 h4-b"> 관련 게시글</p>
        {placeFeeds?.boards && placeFeeds?.boards?.length > 0 ? (
          <div className="mb-4">
            <Card>
              <CardContent className="pt-4">
                {placeFeeds?.boards?.map((article, index) => (
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
                  <p className="text-gray-300 p2-b text-center">관련 게시글이 없습니다</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
