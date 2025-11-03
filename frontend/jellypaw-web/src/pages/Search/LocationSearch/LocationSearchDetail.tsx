import BackHeader from '@/components/headers/BackHeader';
import LocationProfile from './components/LocationProfile';
import LocationInfo from './components/LocationInfo';

// 더미 데이터
const locationProfileData = {
  name: '서현 동물병원',
  category: '병원 / 약국',
  address: '광주 남구 천변좌로 370',
  rating: 4.5,
  phone: '02-1234-5678',
  url: 'http://place.map.kakao.com/916658512',
  profileImageUrl: '/src/assets/hospitals/동물병원.png',
  runningTime: [
    { id: 1, name: '월요일', start: '09:00', end: '18:00' },
    { id: 2, name: '화요일', start: '09:00', end: '18:00' },
    { id: 3, name: '수요일', start: '09:00', end: '18:00' },
    { id: 4, name: '목요일', start: '09:00', end: '18:00' },
    { id: 5, name: '금요일', start: '09:00', end: '18:00' },
    { id: 6, name: '토요일', start: '09:00', end: '15:00' },
    { id: 7, name: '일요일', start: '휴무', end: '휴무' },
  ],
  description: '서현 동물병원은 광주 남구 천변좌로 370에 위치한 동물병원입니다. 초코와 함께하는 일상을 기록하고 있어요.',
  CertifiedStaffs: [
    {
      name: '김수의',
      specialties: '응급의학, 마취과',
      experience: '경력 12년',
      profileImageUrl: '/src/assets/search/person1.png',
    },
    {
      name: '이수의',
      specialties: '내과, 외과',
      experience: '경력 8년',
      profileImageUrl: '/src/assets/search/person1.png',
    },
    {
      name: '박수의',
      specialties: '산과, 부인과',
      experience: '경력 15년',
      profileImageUrl: '/src/assets/search/person1.png',
    },
  ],
};

export default function LocationSearchDetail() {
  return (
    <>
      <BackHeader title="" />
      <div className="flex flex-col gap-4 mb-4">
        {/* 장소 프로필 , 기능 목록, 기본 정보, 인증직원(존재할 때만)*/}
        <LocationProfile {...locationProfileData} />
        {/* 운영시간, 소개 글글 */}
        <LocationInfo {...locationProfileData} />
      </div>
    </>
  );
}
