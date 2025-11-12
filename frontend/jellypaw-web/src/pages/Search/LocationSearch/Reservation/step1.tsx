import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@radix-ui/react-label';
import { Calendar } from '@/components/ui/calendar';

interface Step1Props {
  onNext: (data: {
    date: string; // "2025-11-11" 형식
    time: number; // 시간 슬롯 인덱스
    content: string; // 상세 요청사항
  }) => void;
}

const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

export default function Step1({ onNext }: Step1Props) {
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [requestDetails, setRequestDetails] = useState('');
  const [textCount, setTextCount] = useState(0);

  // 날짜를 "YYYY-MM-DD" 형식으로 변환하는 함수
  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 선택된 시간의 인덱스를 찾는 함수
  const getTimeIndex = (time: string | null): number => {
    if (!time) return 0;
    const index = timeSlots.indexOf(time);
    return index >= 0 ? index : 0;
  };

  const handleDateSelect = (date?: Date) => {
    if (!date) return;
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    if (normalized < today) return;
    setSelectedDate(normalized);
  };

  const isSameDay = (a?: Date, b?: Date) => {
    if (!a || !b) return false;
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };

  const disabledTimes = useMemo(() => {
    if (!selectedDate || !isSameDay(selectedDate, today)) {
      return new Set<string>();
    }

    const now = new Date();
    return new Set(
      timeSlots.filter((time) => {
        const [hour, minute] = time.split(':').map(Number);
        const slotDate = new Date(selectedDate);
        slotDate.setHours(hour, minute, 0, 0);
        return slotDate < now;
      }),
    );
  }, [selectedDate, today]);

  useEffect(() => {
    if (selectedTime && disabledTimes.has(selectedTime)) {
      setSelectedTime(null);
    }
  }, [disabledTimes, selectedTime]);

  const handleNext = () => {
    const dateString = formatDate(selectedDate);
    const timeIndex = getTimeIndex(selectedTime);

    onNext({
      date: dateString,
      time: timeIndex,
      content: requestDetails,
    });
  };

  return (
    <>
      {/* Content */}
      <div className="w-full flex flex-col gap-6 mb-6">
        {/* 예약 날짜  - 캘린더*/}
        <div className="flex flex-col gap-2">
          <Label className="text-aqua-500 p2-b">예약 날짜 *</Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={{ before: today }}
            className="rounded-[12px] border"
          />
        </div>

        {/* 예약 시간 - 날짜 선택 시에만 표시 */}
        {selectedDate && (
          <div className="flex flex-col gap-2">
            <Label className="text-aqua-500 p2-b">예약 시간 *</Label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => {
                const isDisabled = disabledTimes.has(time);
                return (
                  <Button
                    key={time}
                    onClick={() => !isDisabled && setSelectedTime(time)}
                    tone={selectedTime === time ? 'default' : 'white'}
                    shape="outline"
                    borderTone={selectedTime === time ? 'default' : 'gray'}
                    disabled={isDisabled}
                  >
                    {time}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* 상세 요청사항 */}
        <div className="flex flex-col gap-2">
          <Label className="text-aqua-500 p2-b">상세 요청사항 *</Label>
          <Textarea
            placeholder="추가 요청사항이나 특이사항을 입력하세요"
            className="h-28"
            value={requestDetails}
            onChange={(e) => {
              setRequestDetails(e.target.value);
              setTextCount(e.target.value.length);
            }}
          />
          <div className="flex justify-end">
            <span className="text-gray-500 text-xs">{textCount}/500</span>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="mb-4">
        <Button className="w-full" onClick={handleNext}>
          다음
        </Button>
      </div>
    </>
  );
}
