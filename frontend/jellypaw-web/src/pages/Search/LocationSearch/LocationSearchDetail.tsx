import BackHeader from '@/components/headers/BackHeader';
import LocationProfile from './LocationProfile';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { BsPersonFillCheck } from 'react-icons/bs';
import CertifiedStaffProfile from './CertifiedStaffProfile';

// 장소 더미 데이터
interface LocationData {
  name: string;
  category: string;
  address: string;
  rating: number;
  phone: string;
  url: string;
  runningTime: { id: number; name: string; start: string | '휴무'; end: string | '휴무' }[];
  description: string;
  profileImageUrl: string;
  CertifiedStaffs: { name: string; specialties: string; experience: string; profileImageUrl: string }[];
}
const locationData: LocationData = {
  name: '서현 동물병원',
  category: '병원 / 약국',
  address: '광주 남구 천변좌로 370',
  rating: 4.5,
  phone: '02-1234-5678',
  url: 'http://place.map.kakao.com/916658512',
  runningTime: [
    { id: 1, name: '월요일', start: '09:00', end: '18:00' },
    { id: 2, name: '화요일', start: '09:00', end: '18:00' },
    { id: 3, name: '수요일', start: '09:00', end: '18:00' },
    { id: 4, name: '목요일', start: '09:00', end: '18:00' },
    { id: 5, name: '금요일', start: '09:00', end: '18:00' },
    { id: 6, name: '토요일', start: '09:00', end: '15:00' },
    { id: 7, name: '일요일', start: '휴무', end: '휴무' },
  ],
  description: '서현 동물병원은 광주 남구 천변좌로 370에 위치한 동물병원입니다. 초코와 함께하는 일상을 기록하고 있어요',
  profileImageUrl: '/src/assets/hospitals/동물병원.png',
  CertifiedStaffs: [
    {
      name: '김수의',
      specialties: '응급의학, 마취과',
      experience: '경력 12년',
      profileImageUrl: '/src/assets/search/person1.png',
    },
    {
      name: '이수의',
      specialties: '응급의학, 마취과',
      experience: '경력 12년',
      profileImageUrl: '/src/assets/search/person1.png',
    },
    {
      name: '박수의',
      specialties: '응급의학, 마취과',
      experience: '경력 12년',
      profileImageUrl: '/src/assets/search/person1.png',
    },
  ],
};
export default function LocationSearchDetail() {
  return (
    <>
      <BackHeader title="" />
      <div className="flex flex-col gap-4">
        {/* 장소 프로필 */}
        <LocationProfile {...locationData} />
        {/* 인증 직원 - 있을 때만 보이기 */}
        {locationData.CertifiedStaffs.length > 0 && (
          <Card className="p-6 mb-4">
            <CardHeader>
              <div className="flex items-center gap-2 mb-3">
                <BsPersonFillCheck className="text-aqua-300 w-4 h-4" />
                <div className="text-aqua-500 h6">인증 직원</div>
              </div>
            </CardHeader>
            <CardContent>
              {locationData.CertifiedStaffs.map((staff) => (
                <CertifiedStaffProfile key={staff.name} {...staff} />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
