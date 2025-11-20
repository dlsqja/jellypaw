import BackHeader from '@/components/headers/BackHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FaStar } from 'react-icons/fa6';
import { SlCalender } from 'react-icons/sl';
import { SlLocationPin } from 'react-icons/sl';
import { MdPhone } from 'react-icons/md';
import { FaLocationDot } from 'react-icons/fa6';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { searchPlacesDetail } from '@/services/api/search';
import type { SearchPlacesDetailResponse } from '@/types/search';
import GoogleMap from './components/LocationMap';

// 슬롯 인덱스를 시간 문자열로 변환 (0 = 00:00, 47 = 23:30) -> "오전 12:00", "오후 2:00" 형식
const slotIndexToTimeString = (slotIndex: number): string => {
  const hour = Math.floor(slotIndex / 2);
  const minute = (slotIndex % 2) * 30;
  const minuteStr = String(minute).padStart(2, '0');

  if (hour === 0) {
    return `오전 12:${minuteStr}`;
  } else if (hour < 12) {
    return `오전 ${hour}:${minuteStr}`;
  } else if (hour === 12) {
    return `오후 12:${minuteStr}`;
  } else {
    return `오후 ${hour - 12}:${minuteStr}`;
  }
};

// 날짜 형식 변환 (2025-12-04 -> 11월 13일 (토))
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10); // 앞의 0 제거
    const day = parseInt(parts[2], 10); // 앞의 0 제거

    // Date 객체 생성 (월은 0부터 시작하므로 -1)
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

    return `${month}월 ${day}일 (${weekdays[dayOfWeek]})`;
  }
  return dateString;
};

export default function MyReservationDetail() {
  const location = useLocation();
  const reservationData = location.state;
  console.log('state로 받아온 예약데이터:', reservationData);
  const [placeData, setPlaceData] = useState<SearchPlacesDetailResponse | null>(null);

  // 가게 정보 불러오기
  useEffect(() => {
    searchPlacesDetail(reservationData.placeId).then((response) => {
      setPlaceData(response);
    });
  }, [reservationData.placeId]);

  console.log('가게 정보:', placeData);
  return (
    <>
      <BackHeader title="예약 상세" />
      <div className="flex flex-col gap-4">
        {/* 카드 1 */}
        {/* 예약 정보 */}
        <Card className="p-4">
          <CardHeader>
            <h2 className="text-aqua-500 h6-b">예약 정보</h2>
          </CardHeader>
          <CardContent>
            <div className="mt-2 flex flex-col gap-3">
              <div className="flex gap-3">
                <span className="text-aqua-500 p2 flex gap-1">
                  {formatDate(reservationData.date)}
                  <span className="text-aqua-500 p2-">{slotIndexToTimeString(reservationData.time)}</span>
                </span>
              </div>
              <div className="flex flex-col gap-1 ">
                <p className="text-aqua-500 p2-b">요청 사항</p>
                <p className="text-aqua-500 p2 whitespace-pre-line break-words">{reservationData.content}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/*카드 2*/}
        {/* 오시는 길 */}
        <Card className="p-4 mb-4">
          <CardHeader>
            <h2 className="text-aqua-500 h6-b">오시는 길</h2>
          </CardHeader>
          <CardContent>
            {/* 구글맵 */}
            <GoogleMap address={placeData?.address || ''} title={placeData?.title || ''} />
            <div className="flex flex-col gap-3">
              <h2 className="text-aqua-500 h5-b">{placeData?.title}</h2>
              <div className="flex gap-3 items-center">
                <FaLocationDot className="text-aqua-300 w-3.5 h-3.5" />
                <span className="text-aqua-500 p2">{placeData?.address}</span>
              </div>
              <div className="flex gap-3 items-center">
                <MdPhone className="text-aqua-300 w-3.5 h-3.5" />
                <span className="text-aqua-500 p2">{placeData?.phoneNumber}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 버튼 그룹 */}
        {/* <div className="flex flex-col gap-3"> */}
        {/* <Button size="default" shape="pillSolid" tone="aqua" className="w-full">
            <MdOutlinePhone className="text-white w-3.5 h-3.5" /> 업체에 전화하기
          </Button> */}
        {/* <Button size="default" shape="pillSolid" tone="red" borderTone="pink" className="w-full">
            예약 취소
          </Button> */}
      </div>
    </>
  );
}
