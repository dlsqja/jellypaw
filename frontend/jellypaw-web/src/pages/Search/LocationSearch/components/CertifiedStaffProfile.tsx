interface CertifiedStaffProfileProps {
  name: string;
  profileImageUrl?: string;
  description?: string;
  onClick?: () => void;
}

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export default function CertifiedStaffProfile({ name, profileImageUrl, description, onClick }: CertifiedStaffProfileProps) {
  return (
    <>
      {/* 프로필 이미지 */}
      <div
        className={`p-4 bg-gray-100 border border-gray-200 rounded-[12px] inline-flex justify-start items-center ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <img className="w-12 h-12 rounded-full object-cover" src={`${IMAGE_BASE_URL}${profileImageUrl}`} alt={name} />
        {/* 이름, 직급, 경력 */}
        <div className="pl-4 flex flex-col">
          <div className="text-aqua-500 p2-b">{name}</div>
          <div className="text-gray-400 caption1">{description || '소개글 정보가 없습니다'}</div>
        </div>
      </div>
    </>
  );
}
