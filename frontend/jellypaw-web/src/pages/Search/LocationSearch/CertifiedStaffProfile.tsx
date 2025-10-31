interface CertifiedStaffProfileProps {
  name: string;
  specialties: string;
  experience: string;
  profileImageUrl?: string;
}

export default function CertifiedStaffProfile({
  name,
  specialties,
  experience,
  profileImageUrl = '/src/assets/search/person1.png',
}: CertifiedStaffProfileProps) {
  return (
    <>
      {/* 프로필 이미지 */}
      <div className="p-4 bg-gray-100 rounded-[12px] inline-flex justify-start items-center shadow-[0px_4px_12px_0px_rgba(0,0,0,0.05)]">
        <img className="w-12 h-12 rounded-full object-cover" src={profileImageUrl} alt={name} />
        {/* 이름, 직급, 경력 */}
        <div className="pl-4 flex flex-col">
          <div className="text-aqua-500 p2-b">{name}</div>
          <div className="text-aqua-500 p3">{specialties}</div>
          <div className="text-gray-400 caption1">{experience}</div>
        </div>
      </div>
    </>
  );
}
