import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@radix-ui/react-label';
import { Calendar } from '@/components/ui/calendar';
import { parseWorkingHours, parseWorkingHoursToSlots } from '@/utils/workingHour';

// step2로 넘길 때 데이터 타입
interface Step1Props {
  onNext: (data: {
    date: string; // "2025-11-11" 형식
    time: number; // 시간 슬롯
    content: string; // 상세 요청사항
  }) => void;
  openingHours: string;
}

// 캘린더 요일 선택했을 떄 이름 지정정
const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

// 시간 슬롯을 문자열로 변환
const slotIndexToTimeString = (slot: number): string | null => {
  if (slot < 0 || slot > 47) {
    return null;
  }

  const hour = Math.floor(slot / 2);
  const minute = (slot % 2) * 30;

  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

// 예약 날짜 및 시간 선택 컴포넌트
export default function Step1({ onNext, openingHours }: Step1Props) {
  const parsedWorkingHours = parseWorkingHours(openingHours);
  const parsedWorkingHoursSlots = parseWorkingHoursToSlots(parsedWorkingHours);
  // console.log('parsedWorkingHoursSlots', parsedWorkingHoursSlots);

  // 요일별 시간 슬롯 옵션 생성
  const timeOptionsByDay = useMemo(() => {
    return parsedWorkingHoursSlots.reduce<Record<string, { slot: number; label: string }[]>>((acc, { day, slots }) => {
      const options = slots
        .map((slot) => {
          const label = slotIndexToTimeString(slot);
          if (!label) {
            return null;
          }

          return { slot, label };
        })
        .filter((option): option is { slot: number; label: string } => option !== null);

      acc[day] = options;
      return acc;
    }, {});
  }, [parsedWorkingHoursSlots]);

  // 오늘 날짜 설정
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  // 선택된 날짜 및 시간 상태 관리
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [requestDetails, setRequestDetails] = useState('');
  const [textCount, setTextCount] = useState(0);

  // 선택된 날짜에 따른 시간 슬롯 옵션 생성
  const timeOptions = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    const dayName = dayNames[selectedDate.getDay()];
    return timeOptionsByDay[dayName] || [];
  }, [selectedDate, timeOptionsByDay]);

  // 날짜를 "YYYY-MM-DD" 형식으로 변환하는 함수
  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  // 선택된 날짜에 따른 비활성화된 시간 슬롯 생성
  const disabledTimes = useMemo(() => {
    if (!selectedDate || !isSameDay(selectedDate, today)) {
      return new Set<number>();
    }

    const now = new Date();
    return new Set(
      timeOptions
        .filter((option) => {
          const [hour, minute] = option.label.split(':').map(Number);
          if (Number.isNaN(hour) || Number.isNaN(minute)) {
            return false;
          }

          const slotDate = new Date(selectedDate);
          slotDate.setHours(hour, minute, 0, 0);
          return slotDate < now;
        })
        .map((option) => option.slot),
    );
  }, [selectedDate, today, timeOptions]);

  // 선택된 시간이 비활성화된 시간 슬롯일 때 선택 초기화
  useEffect(() => {
    if (selectedTime !== null && disabledTimes.has(selectedTime)) {
      setSelectedTime(null);
    }
  }, [disabledTimes, selectedTime]);

  // 선택된 시간이 가능한 시간 슬롯이 아닐 때 선택 초기화
  useEffect(() => {
    if (selectedTime !== null && !timeOptions.some((option) => option.slot === selectedTime)) {
      setSelectedTime(null);
    }
  }, [selectedTime, timeOptions]);

  // 선택된 날짜에 따른 시간 슬롯 옵션 콘솔 로깅
  useEffect(() => {
    if (selectedDate) {
      const dayName = dayNames[selectedDate.getDay()];
      const slotsForDay = timeOptions.map((option) => option.label);
    }
  }, [selectedDate, timeOptions]);

  // 다음 버튼 클릭 시 데이터 전송
  const handleNext = () => {
    const dateString = formatDate(selectedDate);
    const timeSlotValue = selectedTime !== null ? selectedTime : timeOptions.length > 0 ? timeOptions[0].slot : 0;
    console.log('dateString', dateString);
    console.log('timeSlotValue', timeSlotValue);
    console.log('requestDetails', requestDetails);
    // 다음 버튼 클릭 시 데이터 전송
    onNext({
      date: dateString,
      time: timeSlotValue,
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
              {timeOptions.map((option) => {
                const isDisabled = disabledTimes.has(option.slot);
                const isSelected = selectedTime === option.slot;
                return (
                  <Button
                    key={option.slot}
                    onClick={() => !isDisabled && setSelectedTime(option.slot)}
                    tone={isSelected ? 'default' : 'white'}
                    shape="outline"
                    borderTone={isSelected ? 'default' : 'gray'}
                    disabled={isDisabled}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </div>
            {timeOptions.length === 0 && <p className="text-gray-400 p2-b text-center">예약 가능한 시간이 없습니다.</p>}
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
