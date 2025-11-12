import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BackHeader from '@/components/headers/BackHeader';
import LocationProfile from './components/LocationProfile';
import LocationInfo from './components/LocationInfo';
import { searchPlacesDetail } from '@/services/api/search';
import type { SearchPlacesDetailResponse } from '@/types/search';
import { Spinner } from '@/components/ui/spinner';

export default function LocationSearchDetail() {
  const { locationId } = useParams();
  const [locationData, setLocationData] = useState<SearchPlacesDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <>
        <BackHeader title="" />
        <div className="flex flex-col justify-center items-center gap-4 py-8">
          <Spinner className="size-8 text-aqua-500" />
          <span className="text-gray-500 p2">장소 정보를 불러오는 중...</span>
        </div>
      </>
    );
  }

  // 데이터가 없을 때 표시
  if (!locationData) {
    return (
      <>
        <BackHeader title="" />
        <div className="flex flex-col justify-center items-center gap-4 py-8">
          <p className="text-gray-500 p2">장소 정보를 불러올 수 없습니다.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <BackHeader title="" />
      <div className="flex flex-col gap-4 mb-4">
        {/* 장소 프로필 , 기능 목록, 기본 정보, 인증직원(존재할 때만)*/}
        <LocationProfile {...locationData} />
        {/* 운영시간, 소개 글글 */}
        <LocationInfo openingHours={locationData.openingHours || ''} />
      </div>
    </>
  );
}
