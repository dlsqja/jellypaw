import { useState } from 'react';
import BackHeader from '@/components/headers/BackHeader';
import { Card, CardContent } from '@/components/ui/card';
import Step1Content from '../Reservation/step1';
import Step2Content from '../Reservation/step2';

export default function Function_reservation() {
  const [isStep2, setIsStep2] = useState(false);

  return (
    <>
      <BackHeader title="예약 하기" />

      <Card className="p-4">
        <CardContent className="flex flex-row gap-4 items-center">
          <img className="w-16 h-16 rounded-[12px] object-cover" src="/src/assets/hospitals/동물병원.png" alt="병원 이미지" />
          <div className="flex flex-col gap-1">
            <p className="text-aqua-500 p2-b">서현 동물병원</p>
            <p className="text-gray-500 p2">병원 / 약국</p>
          </div>
        </CardContent>
      </Card>

      {/* Step Indicator */}
      <div className="h-16 flex justify-center items-center px-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex justify-center items-center ${!isStep2 ? 'bg-aqua-300' : 'bg-gray-200'}`}>
            <div className={`p2-b ${!isStep2 ? 'text-white' : 'text-gray-400'}`}>1</div>
          </div>
          <div className={`w-12 h-1 ${isStep2 ? 'bg-aqua-300' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex justify-center items-center ${isStep2 ? 'bg-aqua-300' : 'bg-gray-200'}`}>
            <div className={`p2-b ${isStep2 ? 'text-white' : 'text-gray-400'}`}>2</div>
          </div>
        </div>
      </div>

      {/* Content */}
      {!isStep2 && <Step1Content onNext={() => setIsStep2(true)} />}
      {isStep2 && <Step2Content onPrevious={() => setIsStep2(false)} />}
    </>
  );
}
