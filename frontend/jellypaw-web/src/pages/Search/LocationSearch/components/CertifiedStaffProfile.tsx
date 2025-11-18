import { BsPersonCircle } from 'react-icons/bs';

interface CertifiedStaffProfileProps {
  name: string;
  profileImageUrl?: string | null;
  description?: string;
  onClick?: () => void;
}

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export default function CertifiedStaffProfile({ name, profileImageUrl, description, onClick }: CertifiedStaffProfileProps) {
  return (
    <div className="flex items-center gap-3">
      {/* 프로필 이미지 */}
      {profileImageUrl ? (
        <img className="w-12 h-12 rounded-full object-cover flex-shrink-0" src={`${IMAGE_BASE_URL}${profileImageUrl}`} alt={name} />
      ) : (
        <div className="w-12 h-12 rounded-full outline outline-2 outline-offset-[-2px] outline-aqua-300 flex justify-center items-center flex-shrink-0">
          <BsPersonCircle className="w-6 h-6 text-aqua-300" />
        </div>
      )}
      {/* 이름, 직급, 경력 */}
      <div className="flex flex-col gap-1">
        <div className="text-aqua-500 p2-b">{name}</div>
        <div className="text-gray-400 caption1 line-clamp-2">{description || '소개글 정보가 없습니다'}</div>
      </div>
    </div>
  );
}
