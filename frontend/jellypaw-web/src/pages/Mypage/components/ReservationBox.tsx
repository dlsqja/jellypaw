import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ReservationBoxProps {
  reservationId: number;
  storeName: string;
  date: string;
  price: string;
}

export default function ReservationBox({ reservationId, storeName, date, price }: ReservationBoxProps) {
  const navigate = useNavigate();
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-1">
          <p className="text-aqua-500 p2-b">{storeName}</p>
          <p className="text-aqua-500 p2">{date}</p>
          <p className="text-aqua-500 p2-b">{price}</p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button shape="outline" tone="lightAqua" className="w-full" onClick={() => navigate(`/mypage/reservation/${reservationId}`)}>
          상세보기
        </Button>
        <Button shape="outline" tone="red" borderTone="pink" className="w-full">
          예약취소
        </Button>
      </CardFooter>
    </Card>
  );
}
