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
    <div className="w-16 h-20 flex-shrink-0 inline-flex flex-col justify-start items-center cursor-pointer" onClick={onClick}>
      <div className={`w-16 h-16 p-1.5 rounded-full outline outline-2 outline-offset-[-2px] ${outlineColor} flex flex-col justify-start items-start`}>
        <img className="w-12 h-12 rounded-full object-cover" src={imageUrl} alt={name} />
      </div>

      <div className="w-full flex justify-center items-center pt-2">
        <div className={`text-center p2 ${textColor} leading-5`}>{name}</div>
      </div>
    </div>
  );
}
