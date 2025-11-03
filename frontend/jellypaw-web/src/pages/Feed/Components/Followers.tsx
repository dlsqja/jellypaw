interface FollowersProps {
  imageUrl: string;
  name: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function Followers({ imageUrl, name, isActive = false, onClick }: FollowersProps) {
  const outlineColor = isActive ? 'outline-aqua-300' : 'outline-neutral-200';
  const textColor = isActive ? 'text-aqua-300' : 'text-gray-300';

  return (
    <div className="w-16 h-20 flex flex-col gap-2 items-center cursor-pointer" onClick={onClick}>
      <div className={`w-16 h-16 p-1.5 rounded-full outline outline-2 outline-offset-[-2px] ${outlineColor} flex flex-col justify-start items-start`}>
        <img className="w-14 h-14 rounded-full object-cover" src={imageUrl} alt={name} />
      </div>

      <div className="w-full flex justify-center">
        <div className={`text-center p3-b ${textColor}`}>{name}</div>
      </div>
    </div>
  );
}
