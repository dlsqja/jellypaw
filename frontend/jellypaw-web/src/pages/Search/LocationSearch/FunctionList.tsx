import { FaPhone, FaMapMarkerAlt, FaComment, FaEdit } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

const functionList = [
  {
    name: '기록하기',
    icon: <FaEdit />,
  },
  {
    name: '전화',
    icon: <FaPhone />,
  },
  {
    name: '길찾기',
    icon: <FaMapMarkerAlt />,
  },
  {
    name: '예약',
    icon: <FaComment />,
  },
];

export default function FunctionList() {
  return (
    <div className="flex gap-3">
      {functionList.map((functionItem) => (
        <Button key={functionItem.name} size="lg" shape="solid" tone="aqua" className="w-full flex flex-col items-center">
          <div>{functionItem.icon}</div>
          <div>{functionItem.name}</div>
        </Button>
      ))}
    </div>
  );
}
