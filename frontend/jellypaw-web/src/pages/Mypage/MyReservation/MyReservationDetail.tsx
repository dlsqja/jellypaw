import BackHeader from '@/components/headers/BackHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FaStar } from 'react-icons/fa6';
import { SlCalender } from 'react-icons/sl';
import { SlLocationPin } from 'react-icons/sl';
import { MdOutlinePhone } from 'react-icons/md';
import { IoPawOutline } from 'react-icons/io5';
import { Button } from '@/components/ui/button';
export default function MyReservationDetail() {
  return (
    <>
      <BackHeader title="예약 상세" />
      <div className="flex flex-col gap-5">
        {/*카드 1 */}
        {/* 가게 정보 */}
        <Card className="p-6">
          <CardHeader className="flex flex-col justify-center items-center gap-2">
            <h2 className="text-aqua-500 h4-b">펫살롱 아름다운</h2>
            <div className="flex items-center gap-1">
              <Badge variant="pink">
                <FaStar className="text-pink-300 me-0.5"></FaStar> 5.0
              </Badge>
              <span className="text-aqua-500 p3">(156개 리뷰)</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex gap-3 items-center">
                <SlCalender className="text-aqua-300 w-3.5 h-3.5 " />
                <span className="text-aqua-500 p2">2024년 1월 15일 오후 2:00</span>
              </div>

              <div className="flex gap-3 items-center">
                <IoPawOutline className="text-aqua-300 w-3.5 h-3.5 " />
                <span className="text-aqua-500 p2">초코</span>
              </div>

              <div className="flex gap-3 items-center">
                <SlLocationPin className="text-aqua-300 w-3.5 h-3.5" />
                <span className="text-aqua-500 p2">서울시 강남구 테헤란로 123</span>
              </div>

              <div className="flex gap-3 items-center">
                <MdOutlinePhone className="text-aqua-300 w-3.5 h-3.5" />
                <span className="text-aqua-500 p2">02-1234-5678</span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* 카드 2 */}
        {/* 예약 내용 */}
        <Card className="p-6">
          <CardHeader>
            <h2 className="text-aqua-500 h6-b">예약 내용</h2>
          </CardHeader>
          <CardContent>
            <div className="mt-4 flex flex-col gap-3">
              <p className="text-aqua-500 p2">초코는 물을 무서워하니 천천히 진행해주세요</p>
            </div>
          </CardContent>
        </Card>
        {/* 버튼 그룹 */}
        <div className="flex flex-col gap-3">
          <Button size="default" shape="pillSolid" tone="aqua" className="w-full">
            <MdOutlinePhone className="text-white w-3.5 h-3.5" /> 업체에 전화하기
          </Button>
          <Button size="default" shape="pillSolid" tone="red" borderTone="pink" className="w-full">
            예약 취소
          </Button>
        </div>
      </div>
    </>
  );
}
