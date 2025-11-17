import { FaPaw } from 'react-icons/fa';

interface FollowersProps {
  imageUrl?: string | null;
  name?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function Followers({ imageUrl, name, isActive = false, onClick }: FollowersProps) {
  const outlineColor = isActive ? 'outline-aqua-300' : 'outline-gray-200';
  const textColor = isActive ? 'text-aqua-300' : 'text-gray-300';

  return (
    <div className="w-16 h-20 flex flex-col gap-2 items-center cursor-pointer" onClick={onClick}>
      <div
        className={`w-16 h-16 p-1.5 relative rounded-full outline outline-2 outline-offset-[-2px] ${outlineColor} flex flex-col justify-center items-center`}
      >
        {/* 프로필 이미지 없으면 기본 이미지 */}
        {imageUrl ? (
          <img className="w-full h-full rounded-full object-cover" src={imageUrl} alt={name} />
        ) : (
          <div
            className={`w-16 h-16 p-4 rounded-full outline outline-2 outline-offset-[-2px] ${
              isActive ? 'outline-aqua-300' : 'outline-gray-300'
            } flex flex-col justify-center items-center`}
          >
            <FaPaw className={`w-12 h-12 ${isActive ? 'text-aqua-300' : 'text-gray-200'}`} />
          </div>
        )}
      </div>

      <div className="w-full flex justify-center">
        <div className={`text-center p3-b line-clamp-1 ${textColor}`}>{name}</div>
      </div>
    </div>
  );
}
