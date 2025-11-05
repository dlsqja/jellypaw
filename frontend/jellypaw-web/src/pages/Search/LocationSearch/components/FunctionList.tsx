import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPhone, FaMapMarkerAlt, FaComment, FaEdit } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

interface FunctionListProps {
  phone?: string;
}

const functionList = [
  {
    name: '기록하기',
    icon: <FaEdit />,
  },
  {
    name: '전화',
    icon: <FaPhone />,
  },
  {
    name: '길찾기',
    icon: <FaMapMarkerAlt />,
  },
  {
    name: '예약하기',
    icon: <FaComment />,
  },
];

export default function FunctionList({ phone }: FunctionListProps) {
  const [isPhoneDrawerOpen, setIsPhoneDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { locationId } = useParams();

  const handleReservationClick = () => {
    if (locationId) {
      navigate(`/search/location/${locationId}/reservation`);
    }
  };

  const handleNavigationClick = () => {
    alert('길찾기 기능은 준비 중입니다.');
  };

  return (
    <>
      <div className="flex gap-2.5">
        {functionList.map((functionItem) => {
          // '전화' 누르면 전화번호 모달 오픈
          if (functionItem.name === '전화' && phone) {
            return (
              <Drawer key={functionItem.name} open={isPhoneDrawerOpen} onOpenChange={setIsPhoneDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button size="lg" shape="outline" tone="lightAqua" className="w-full flex flex-col gap-1 items-center hover:bg-aqua-100">
                    <p>{functionItem.icon}</p>
                    <p>{functionItem.name}</p>
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="max-w-[360px] mx-auto">
                  <DrawerHeader>
                    <DrawerTitle>전화번호</DrawerTitle>
                    <DrawerDescription>{phone}</DrawerDescription>
                  </DrawerHeader>
                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button shape="pillSolid" tone="default" className="w-full">
                        <FaPhone /> 전화 걸기
                      </Button>
                    </DrawerClose>
                    <DrawerClose asChild>
                      <Button shape="pillOutline" tone="lightAqua" className="w-full">
                        닫기
                      </Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            );
          }
          // '예약' 누르면 예약 페이지로 이동
          if (functionItem.name === '예약하기') {
            return (
              <Button
                key={functionItem.name}
                size="lg"
                shape="outline"
                tone="lightAqua"
                className="w-full flex flex-col gap-1 items-center"
                // 예약 버튼 클릭하면 예약 페이지로 이동 함수
                onClick={handleReservationClick}
              >
                <p>{functionItem.icon}</p>
                <p>{functionItem.name}</p>
              </Button>
            );
          }
          // '길찾기' 누르면 alert 창 띄우기
          if (functionItem.name === '길찾기') {
            return (
              <Button
                key={functionItem.name}
                size="lg"
                shape="outline"
                tone="lightAqua"
                className="w-full flex flex-col gap-1 items-center"
                onClick={handleNavigationClick}
              >
                <p>{functionItem.icon}</p>
                <p>{functionItem.name}</p>
              </Button>
            );
          }
          return (
            <Button key={functionItem.name} size="lg" shape="outline" tone="lightAqua" className="w-full flex flex-col gap-1 items-center">
              <p>{functionItem.icon}</p>
              <p>{functionItem.name}</p>
            </Button>
          );
        })}
      </div>
    </>
  );
}
