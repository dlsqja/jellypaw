import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@radix-ui/react-label';
import { Calendar } from '@/components/ui/calendar';

interface Step1Props {
  onNext: () => void;
}

const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

export default function Step1({ onNext }: Step1Props) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [textCount, setTextCount] = useState(0);

  return (
    <>
      {/* Content */}
      <div className="w-full flex flex-col gap-6 mb-6">
        {/* 반려동물 이름 */}
        <div className="flex flex-col gap-2">
          <Label className="text-aqua-500 p2-b">반려동물 이름 *</Label>
          <Input placeholder="반려동물 이름을 입력하세요" />
        </div>

        {/* 반려동물 종류 */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-700 text-sm font-semibold">반려동물 종류 *</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dog">강아지</SelectItem>
              <SelectItem value="cat">고양이</SelectItem>
              <SelectItem value="etc">기타</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 예약 날짜  - 캘린더*/}
        <div className="flex flex-col gap-2">
          <Label className="text-aqua-500 p2-b">예약 날짜 *</Label>
          <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-[12px] border" />
        </div>

        {/* 예약 시간 - 날짜 선택 시에만 표시 */}
        {selectedDate && (
          <div className="flex flex-col gap-2">
            <Label className="text-aqua-500 p2-b">예약 시간 *</Label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  tone={selectedTime === time ? 'default' : 'white'}
                  shape="outline"
                  borderTone={selectedTime === time ? 'default' : 'gray'}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 상세 요청사항 */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-900 text-sm font-semibold">상세 요청사항</label>
          <Textarea placeholder="추가 요청사항이나 특이사항을 입력하세요" className="h-28" onChange={(e) => setTextCount(e.target.value.length)} />
          <div className="flex justify-end">
            <span className="text-gray-500 text-xs">{textCount}/500</span>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="mb-4">
        <Button className="w-full" onClick={onNext}>
          다음
        </Button>
      </div>
    </>
  );
}
