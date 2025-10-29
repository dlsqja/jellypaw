import { IoArrowBack } from 'react-icons/io5';

interface BackHeaderProps {
  title: string;
}

export default function BackHeader({ title }: BackHeaderProps) {
  return (
    <div className="w-full h-16 bg-gray-100 flex items-center ps-4">
      <div className="flex items-center gap-4">
        <IoArrowBack size={20} color="#284542" className="mr-2" />
        <div className="text-aqua-500 h4-b">{title}</div>
      </div>
    </div>
  );
}
