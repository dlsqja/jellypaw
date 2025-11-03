import CertifiedStaffProfile from './CertifiedStaffProfile';
import FunctionList from './FunctionList';

import { Badge } from '@/components/ui/badge';
import { FaStar } from 'react-icons/fa6';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { SlLocationPin } from 'react-icons/sl';
import { TbWorld } from 'react-icons/tb';
import { MdOutlinePhone } from 'react-icons/md';
import { BsPersonFillCheck } from 'react-icons/bs';

interface LocationProfileProps {
  name: string;
  category: string;
  address: string;
  rating: number;
  phone: string;
  url: string;
  runningTime: { id: number; name: string; start: string | '휴무'; end: string | '휴무' }[];
  description: string;
  profileImageUrl?: string;
  CertifiedStaffs?: { name: string; specialties: string; experience: string; profileImageUrl: string }[];
}

export default function LocationProfile({
  name,
  category,
  address,
  rating,
  phone,
  url,
  profileImageUrl = '/src/assets/hospitals/동물병원.png',
  CertifiedStaffs = [],
}: LocationProfileProps) {
  return (
    <>
      {/* 가게 기본 프로필 */}
      <div className="flex flex-col items-center">
        {/* 프로필 이미지 */}
        <div className="w-24 h-24 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-neutral-200 flex justify-center items-center">
          <img className="rounded-lg object-cover" src={profileImageUrl} alt={name} />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        {/* 이름 */}
        <div className="text-aqua-500 h4-b text-center">{name}</div>
        {/* 카테고리 */}
        <div className="text-center text-gray-500 p2">{category}</div>
        {/* 평점 */}
        <div className="flex items-center justify-center">
          <Badge variant="pink">
            <FaStar className="text-pink-300 me-0.5"></FaStar> {rating.toFixed(1)}
          </Badge>
        </div>
      </div>
      {/* 기능 목록 */}
      <FunctionList phone={phone} />
      {/* 기본 정보 카드 */}
      <Card className="p-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <IoInformationCircleOutline className="text-aqua-300 w-4 h-4" />
            <div className="text-aqua-500 h6">기본정보</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex gap-3 items-center">
              <SlLocationPin className="text-aqua-500 w-3.5 h-3.5" />
              <span className="text-aqua-500 p2">{address}</span>
            </div>

            <div className="flex gap-3 items-center">
              <MdOutlinePhone className="text-aqua-500 w-3.5 h-3.5" />
              <span className="text-aqua-500 p2">{phone}</span>
            </div>
            <div className="flex gap-3 items-center">
              <TbWorld className="text-aqua-500 w-3.5 h-3.5" />
              <span className="text-aqua-300 p2">{url}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* 인증 직원 카드 - 있을 때만 보이기*/}
      {CertifiedStaffs.length > 0 && (
        <Card className="p-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BsPersonFillCheck className="text-aqua-300 w-4 h-4" />
              <div className="text-aqua-500 h6">인증 직원</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 mt-4">
              {CertifiedStaffs.map((staff, index) => (
                <CertifiedStaffProfile
                  key={index}
                  name={staff.name}
                  specialties={staff.specialties}
                  experience={staff.experience}
                  profileImageUrl={staff.profileImageUrl}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
