import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';

interface BackHeaderProps {
  title: string;
}

export default function BackHeader({ title }: BackHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="w-full h-16 bg-gray-100 flex items-center">
      <div className="flex items-center gap-2">
        <IoArrowBack size={20} color="#284542" className="cursor-pointer" onClick={handleBack} />
        <div className="text-aqua-500 h4-b">{title}</div>
      </div>
    </div>
  );
}
