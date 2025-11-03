import { Button } from '@/components/ui/button';

interface Step2Props {
  onPrevious: () => void;
}

export default function Step2({ onPrevious }: Step2Props) {
  return (
    <>
      {/* Content */}
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Step 2</h1>
        <p>예약 2단계 페이지입니다.</p>
      </div>

      {/* Previous Button */}
      <div className="px-4 mb-4">
        <Button className="w-full" onClick={onPrevious}>
          이전
        </Button>
      </div>
    </>
  );
}
