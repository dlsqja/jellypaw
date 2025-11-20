import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

interface ReservationBoxProps {
  reservationId: number;
  placeName: string;
  time: number;
  date: string;
  content: string;
  placeId: number;
  daysRemaining?: number | null;
}

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

// 예약이 이미 완료되었는지 확인 (과거 날짜이거나 오늘 날짜이고 현재 시간 이전인 경우)
const isReservationCompleted = (dateString: string, slotIndex: number): boolean => {
  if (!dateString) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정하여 날짜만 비교

  // 예약 날짜를 Date 객체로 변환
  const reservationDate = new Date(dateString);
  reservationDate.setHours(0, 0, 0, 0);

  // 예약 날짜가 오늘보다 이전이면 완료된 예약
  if (reservationDate < today) return true;

  // 예약 날짜가 오늘이면 시간을 비교
  if (reservationDate.getTime() === today.getTime()) {
    // 슬롯 인덱스를 시간과 분으로 변환
    const reservationHour = Math.floor(slotIndex / 2);
    const reservationMinute = (slotIndex % 2) * 30;

    // 현재 시간과 비교
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // 예약 시간이 현재 시간 이전인지 확인
    if (reservationHour < currentHour) return true;
    if (reservationHour === currentHour && reservationMinute <= currentMinute) return true;
  }

  return false;
};

export default function ReservationBox({ reservationId, placeName, time, date, content, placeId, daysRemaining }: ReservationBoxProps) {
  const navigate = useNavigate();
  const timeString = slotIndexToTimeString(time);
  const formattedDate = formatDate(date);
  const isCompleted = isReservationCompleted(date, time);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-1">
          {isCompleted ? (
            <div>
              <div className="flex justify-between">
                <p className="text-gray-300 h5-b">{placeName}</p>
              </div>
              <p className="text-gray-300 p2-b">
                {formattedDate} {timeString}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                {daysRemaining !== null && daysRemaining !== undefined && <Badge variant="pink">D-{daysRemaining}</Badge>}
                <p className="text-aqua-500 h5-b">{placeName}</p>
              </div>
              <p className="text-aqua-500 p2-b">
                {formattedDate} {timeString}
              </p>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          size="sm"
          shape="outline"
          tone={isCompleted ? 'default' : 'lightAqua'}
          borderTone={isCompleted ? 'gray' : 'default'}
          className={`w-full px-4 ${isCompleted ? 'bg-gray-100 text-gray-300 border-gray-200 hover:bg-gray-100' : ''}`}
          onClick={() =>
            navigate(`/mypage/reservation/${reservationId}`, {
              state: {
                reservationId,
                placeId,
                placeName,
                time,
                date,
                content,
              },
            })
          }
        >
          예약 내역
        </Button>
        {/* <Button shape="outline" size="sm" tone="red" borderTone="pink" className="w-full">
          예약취소
        </Button> */}
      </CardFooter>
    </Card>
  );
}
