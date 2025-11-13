import CertifiedStaffProfile from './CertifiedStaffProfile';
import FunctionList from './FunctionList';
import { FaMapLocation } from 'react-icons/fa6';
import { Badge } from '@/components/ui/badge';
import { FaStar } from 'react-icons/fa6';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { SlLocationPin } from 'react-icons/sl';
import { TbWorld } from 'react-icons/tb';
import { MdOutlinePhone } from 'react-icons/md';
import type { SearchPlacesDetailResponse } from '@/types/search';
import { BsPersonFillCheck } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

export default function LocationProfile({
  id,
  title,
  address,
  phoneNumber,
  link,
  starRating,
  postCount,
  openingHours,
  user,
}: SearchPlacesDetailResponse) {
  const navigate = useNavigate();

  // 사용자 프로필 상세 페이지로 이동
  const handleUserProfileClick = () => {
    if (user?.userId) {
      navigate(`/search/person/${user.userId}`);
    }
  };

  return (
    <>
      {/* 가게 기본 프로필 */}
      <div className="flex flex-col items-center">
        {/* 프로필 이미지 */}
        <div className="w-24 h-24 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-neutral-200 flex justify-center items-center">
          <FaMapLocation className="text-aqua-500 w-12 h-12" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        {/* 이름 */}
        <div className="text-aqua-500 h4-b text-center">{title || '장소명 없음'}</div>
        {/* 평점 */}
        <div className="flex items-center justify-center">
          {starRating && starRating > 0 && (
            <Badge variant="pink">
              <FaStar className="text-pink-300 me-0.5" /> {starRating?.toFixed(1) || ''}
            </Badge>
          )}
          {!starRating && <span className="text-gray-300 p3"> 평점 정보가 없습니다</span>}
        </div>
      </div>
      {/* 기능 목록 */}
      <FunctionList
        phone={phoneNumber || '전화번호 정보가 없습니다'}
        // 장소 상세 정보에서 조회된 id 값과 이름으로 예약 페이지 이동 경로
        locationId={id}
        locationTitle={title}
        openingHours={openingHours}
        user={user}
      />
      {/* 기본 정보 카드 */}
      <Card className="p-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <IoInformationCircleOutline className="text-aqua-300 w-4 h-4" />
            <div className="text-aqua-500 h6">기본 정보</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex gap-3 items-center">
              <SlLocationPin className="text-aqua-500 w-3.5 h-3.5" />
              <span className="text-aqua-500 p2">{address || '주소 정보가 없습니다'}</span>
            </div>

            <div className="flex gap-3 items-center">
              <MdOutlinePhone className="text-aqua-500 w-3.5 h-3.5" />
              <span className="text-aqua-500 p2">{phoneNumber || '전화번호 정보가 없습니다'}</span>
            </div>
            <div className="flex gap-3 items-center">
              <TbWorld className="text-aqua-500 w-3.5 h-3.5 flex-shrink-0" />
              {link ? (
                <a
                  href={link.startsWith('http://') || link.startsWith('https://') ? link : `https://${link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-aqua-300 p2 hover:text-aqua-500 underline cursor-pointer break-all line-clamp-1"
                >
                  {link}
                </a>
              ) : (
                <span className="text-aqua-300 p2">홈페이지 정보가 없습니다</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* 인증 직원 카드 - 있을 때만 보이기 */}
      {user ? (
        <Card className="p-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BsPersonFillCheck className="text-aqua-300 w-4 h-4" />
              <div className="text-aqua-500 h6">인증 직원</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 mt-4">
              <CertifiedStaffProfile
                name={user.nickname || ''}
                profileImageUrl={user.profileImg || ''}
                description={user.description || ''}
                onClick={handleUserProfileClick}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
