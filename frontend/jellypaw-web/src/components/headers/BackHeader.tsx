export default function BackHeader() {
  return (
    <div className="w-80 h-16 relative bg-gray-100">
      <div className="w-80 h-16 left-0 top-0 absolute inline-flex justify-between items-center">
        <div className="w-9 h-7 relative">
          <div className="w-9 h-7 left-0 top-0 absolute inline-flex justify-start items-center">
            <div className="justify-center text-gray-700 text-xl font-bold font-['Pretendard'] leading-7">피드</div>
          </div>
        </div>
        <div className="w-[0.01px] h-[0.01px]" />
      </div>
    </div>
  );
}
