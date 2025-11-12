import { useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import BackHeader from '@/components/headers/BackHeader';
import { Card, CardContent } from '@/components/ui/card';
import Step1Content from '../Reservation/step1';
import Step2Content from '../Reservation/step2';
import { FaMapLocation } from 'react-icons/fa6';
import { createReservation } from '@/services/api/reservation';
import type { ReservationRequest } from '@/types/reservation';

// 예약 데이터 타입 정의
interface ReservationData {
  date: string; // "2025-11-11" 형식
  time: number; // 시간 슬롯 인덱스
  content: string; // 상세 요청사항
}

export default function Function_reservation() {
  const [isStep2, setIsStep2] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const { locationId } = useParams();
  const navigate = useNavigate();
  const locationTitle = (location.state as { locationTitle?: string })?.locationTitle || '장소명 없음';
  const openingHours = (location.state as { openingHours?: string })?.openingHours || '';

  // 예약 데이터 상태 관리
  const [reservationData, setReservationData] = useState<ReservationData>({
    date: '',
    time: 0,
    content: '',
  });

  // Step1에서 Step2로 넘어갈 때 호출
  const handleStep1Next = (step1Data: { date: string; time: number; content: string }) => {
    // Step1에서 입력한 데이터를 ReservationData 타입으로 업데이트
    const ReservationSubmitData: ReservationData = {
      date: step1Data.date,
      time: step1Data.time,
      content: step1Data.content,
    };
    setReservationData(ReservationSubmitData);
    setIsStep2(true);
  };

  // 예약 요청 핸들러
  const handleReservationSubmit = async () => {
    if (!locationId || !reservationData.date || !reservationData.content) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      createReservation(Number(locationId), reservationData);
      alert('예약 요청이 완료되었습니다.');
      // 성공하면 마이페이지로 이동
      navigate('/mypage');
    } catch (error) {
      console.error('예약 요청 실패:', error);
      alert('예약 요청에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <BackHeader title="예약 하기" />

      <Card className="p-4">
        <CardContent className="flex flex-row gap-4 items-center">
          {/* 장소 이미지 */}
          <FaMapLocation className="text-aqua-300 w-12 h-12" />
          <div className="flex flex-col gap-1">
            <p className="text-aqua-500 p2-b">{locationTitle}</p>
          </div>
        </CardContent>
      </Card>

      {/* Step Indicator */}
      <div className="h-16 flex justify-center items-center px-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex justify-center items-center ${!isStep2 ? 'bg-aqua-300' : 'bg-gray-200'}`}>
            <div className={`p2-b ${!isStep2 ? 'text-white' : 'text-gray-400'}`}>1</div>
          </div>
          <div className="w-12 h-1 bg-gray-200" />
          <div className={`w-8 h-8 rounded-full flex justify-center items-center ${isStep2 ? 'bg-aqua-300' : 'bg-gray-200'}`}>
            <div className={`p2-b ${isStep2 ? 'text-white' : 'text-gray-400'}`}>2</div>
          </div>
        </div>
      </div>

      {/* Content */}
      {!isStep2 && (
        <Step1Content
          openingHours={openingHours}
          onNext={(step1Data) => {
            handleStep1Next(step1Data);
          }}
        />
      )}
      {isStep2 && (
        <Step2Content
          onPrevious={() => setIsStep2(false)}
          reservationData={reservationData}
          onSubmit={handleReservationSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
}
