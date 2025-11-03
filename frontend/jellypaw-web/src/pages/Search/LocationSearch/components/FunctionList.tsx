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
    name: '예약',
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

  return (
    <>
      <div className="flex gap-3">
        {functionList.map((functionItem) => {
          // '전화' 누르면 전화번호 모달 오픈
          if (functionItem.name === '전화' && phone) {
            return (
              <Drawer key={functionItem.name} open={isPhoneDrawerOpen} onOpenChange={setIsPhoneDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button size="lg" shape="solid" tone="aqua" className="w-full flex flex-col items-center">
                    <div>{functionItem.icon}</div>
                    <div>{functionItem.name}</div>
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
          if (functionItem.name === '예약') {
            return (
              <Button
                key={functionItem.name}
                size="lg"
                shape="solid"
                tone="aqua"
                className="w-full flex flex-col items-center"
                // 예약 버튼 클릭하면 예약 페이지로 이동 함수
                onClick={handleReservationClick}
              >
                <div>{functionItem.icon}</div>
                <div>{functionItem.name}</div>
              </Button>
            );
          }
          return (
            <Button key={functionItem.name} size="lg" shape="solid" tone="aqua" className="w-full flex flex-col items-center">
              <div>{functionItem.icon}</div>
              <div>{functionItem.name}</div>
            </Button>
          );
        })}
      </div>
    </>
  );
}
