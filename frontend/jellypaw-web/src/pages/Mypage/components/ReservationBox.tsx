import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ReservationBoxProps {
  reservationId: number;
  placeName: string;
  time: number;
  date: string;
  content: string;
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

// 날짜 형식 변환 (2025-12-04 -> 2025년 12월 4일)
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parseInt(parts[1], 10); // 앞의 0 제거
    const day = parseInt(parts[2], 10); // 앞의 0 제거
    return `${month}월 ${day}일`;
  }
  return dateString;
};

export default function ReservationBox({ reservationId, placeName, time, date, content }: ReservationBoxProps) {
  const navigate = useNavigate();
  const timeString = slotIndexToTimeString(time);
  const formattedDate = formatDate(date);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-1">
          <p className="text-aqua-500 h5-b">{placeName}</p>
          <p className="text-aqua-500 p2-b">
            {formattedDate} {timeString}
          </p>
          <p className="text-aqua-500 p2">{content}</p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {/* <Button shape="outline" tone="lightAqua" className="w-full" onClick={() => navigate(`/mypage/reservation/${reservationId}`)}>
          상세보기
        </Button> */}
        {/* <Button shape="outline" size="sm" tone="red" borderTone="pink" className="w-full">
          예약취소
        </Button> */}
      </CardFooter>
    </Card>
  );
}
