import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ReservationBoxProps {
  storeName: string;
  date: string;
  price: string;
}

export default function ReservationBox({ storeName, date, price }: ReservationBoxProps) {
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
        <Button shape="outline" tone="lightAqua" className="w-full">
          상세보기
        </Button>
        <Button shape="outline" tone="red" borderTone="pink" className="w-full">
          예약취소
        </Button>
      </CardFooter>
    </Card>
  );
}
