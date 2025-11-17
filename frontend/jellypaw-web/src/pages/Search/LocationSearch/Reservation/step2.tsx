import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';

interface Step2Props {
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

// 전화번호 포맷팅 함수 (010-0000-0000 형식)
const formatPhoneNumber = (value: string): string => {
  // 숫자만 추출
  const numbers = value.replace(/[^\d]/g, '');

  // 최대 11자리까지만 허용
  const limitedNumbers = numbers.slice(0, 11);

  // 3자리-4자리-4자리 형식으로 포맷팅
  if (limitedNumbers.length <= 3) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 7) {
    return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`;
  } else {
    return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`;
  }
};

export default function Step2({ onPrevious, onSubmit, isSubmitting = false }: Step2Props) {
  const [guardianName, setGuardianName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // 연락처 입력 핸들러
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  // 보호자 이름 입력 핸들러
  const handleGuardianNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuardianName(e.target.value);
  };

  return (
    <>
      {/* Content */}
      <div className="w-full flex flex-col gap-6 mb-6">
        {/* 보호자 이름 입력 */}
        <div className="flex flex-col gap-2">
          <Label className="text-aqua-500 p2-b">보호자 이름 *</Label>
          <Input placeholder="보호자 이름을 입력하세요" value={guardianName} onChange={handleGuardianNameChange} />
        </div>

        {/* 연락처 입력 */}
        <div className="flex flex-col gap-2">
          <Label className="text-aqua-500 p2-b">연락처 *</Label>
          <Input placeholder="보호자 연락처를 입력하세요" value={phoneNumber} onChange={handlePhoneChange} />
        </div>
      </div>

      {/* 버튼들 */}
      <div className="flex justify-between gap-2 ">
        <Button shape="outline" tone="lightAqua" className="w-full" onClick={onPrevious}>
          이전
        </Button>
        <Button shape="solid" tone="aqua" className="w-full" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? '예약 요청 중...' : '예약 요청'}
        </Button>
      </div>
    </>
  );
}
