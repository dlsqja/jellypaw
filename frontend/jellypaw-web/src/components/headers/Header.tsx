interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <div className="w-full h-16 bg-gray-100 flex items-center ps-4">
      <div className="text-aqua-500 h4-b">{title}</div>
    </div>
  );
}
