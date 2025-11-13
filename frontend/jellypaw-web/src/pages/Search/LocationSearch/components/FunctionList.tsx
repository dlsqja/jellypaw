import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import type { GetProfileResponse } from '@/types/mypage';

// 기능 목록 컴포넌트 속성 인터페이스
interface FunctionListProps {
  // 전화번호 - 전화번호 모달에서 사용
  phone?: string;
  // 장소 ID - 예약하기 페이지 이동 경로
  locationId?: number;
  // 장소 이름 - 예약하기 페이지에서 사용
  locationTitle?: string;
  // 운영시간 - 예약하기 페이지에서 사용
  openingHours?: string;
  // 사용자 정보 - 예약하기 버튼 표시 여부 결정
  user?: GetProfileResponse | null;
}

// 기능 목록 배열
const functionList = [
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

// 기능 목록 컴포넌트
export default function FunctionList({ phone, locationId, locationTitle, openingHours, user }: FunctionListProps) {
  const [isPhoneDrawerOpen, setIsPhoneDrawerOpen] = useState(false);
  const navigate = useNavigate();

  // 예약 버튼 클릭 함수
  const handleReservationClick = () => {
    if (locationId) {
      // 장소 상세 정보에서 조회된 id 값과 이름으로 예약 페이지 이동
      navigate(`/search/location/${locationId}/reservation`, {
        state: {
          locationTitle: locationTitle || '장소명 없음',
          openingHours: openingHours || '',
        },
      });
    } else {
      console.warn('예약하기를 제공하지 않는 장소입니다.');
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
          // '예약' 누르면 예약 페이지로 이동 - user가 있을 때만 표시
          if (functionItem.name === '예약하기') {
            // user가 없으면 예약하기 버튼 표시하지 않음
            if (!user) {
              return null;
            }
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
