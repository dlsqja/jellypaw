interface PetProfileItemProps {
  name: string;
  imageUrl?: string;
  isActive?: boolean;
  isDefault?: boolean; // "전체" 같은 기본 아이템인지
}

export default function PetProfileItem({ name, imageUrl, isActive = false, isDefault = false }: PetProfileItemProps) {
  const opacity = isActive ? '' : 'opacity-70';
  const outlineColor = isActive ? 'outline-emerald-300' : 'outline-neutral-200';

  return (
    <div className={`pl-4 flex justify-start items-start ${isDefault ? 'pl-0' : ''}`}>
      <div className={`w-16 h-20 ${opacity} inline-flex flex-col justify-start items-center`}>
        <div
          className={`w-16 h-16 p-1.5 rounded-full outline outline-2 outline-offset-[-2px] ${outlineColor} flex flex-col justify-start items-start`}
        >
          {isDefault ? (
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-300 to-emerald-400 rounded-full inline-flex justify-center items-center">
              <div className="w-5 h-7 relative flex justify-center items-center">
                <div className="w-5 h-5 left-[-0.41px] top-[4px] absolute overflow-hidden">
                  <div className="w-4 h-4 left-[1.60px] top-[1.25px] absolute bg-white" />
                </div>
              </div>
            </div>
          ) : (
            <img className="w-12 h-12 max-w-16 rounded-full" src={imageUrl || 'https://placehold.co/52x52'} alt={name} />
          )}
        </div>
        <div className="pt-2 inline-flex justify-start items-start">
          <div className="w-6 h-4 flex justify-center items-center">
            <div className="p2 text-aqua-300">{name}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
