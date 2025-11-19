import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';

interface BackHeaderProps {
  title: string;
  to?: string; // 특정 경로로 이동할 때 사용
}

export default function BackHeader({ title, to }: BackHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    console.log('[BackHeader] handleBack called, to:', to);
    // 특정 경로로 이동할 때 사용
    if (to) {
      console.log('[BackHeader] Navigating to:', to);
      navigate(to);
    } else {
    // 아니면 무조건 뒤로가기
      console.log('[BackHeader] Navigating back');
      navigate(-1);
    }
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
