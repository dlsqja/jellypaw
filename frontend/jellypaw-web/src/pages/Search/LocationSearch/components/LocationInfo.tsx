import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { parseWorkingHours, parseWorkingHoursToSlots } from '@/utils/workingHour';
import { FiClock } from 'react-icons/fi';
import { IoDocumentTextOutline } from 'react-icons/io5';

interface LocationInfoProps {
  openingHours: string;
}

export default function LocationInfo({ openingHours }: LocationInfoProps) {
  const parsedWorkingHours = parseWorkingHours(openingHours);
  console.log('parsedWorkingHours', parsedWorkingHours);
  const parsedWorkingHoursSlots = parseWorkingHoursToSlots(parsedWorkingHours);
  console.log('parsedWorkingHoursSlots', parsedWorkingHoursSlots);

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FiClock className="text-aqua-300 w-4 h-4" />
            <div className="text-aqua-500 h6">운영시간</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 mt-4">
            {/* 운영시간 표시 */}

            {parsedWorkingHours.length > 0 ? (
              // 요일별 운영시간 표시
              parsedWorkingHours.map((item, index) => (
                // 요일과 시간 표시
                <div key={index} className="flex justify-between">
                  <p className="text-aqua-500 p2">{item.day}</p>
                  {/* 시간 정보 없을 시  휴무 표시 */}
                  {item.time === '휴무' || item.time.toLowerCase().includes('휴무') ? (
                    // 휴무 표시
                    <p className="text-pink-400 p2-b">휴무</p>
                  ) : (
                    <p className="text-aqua-500 p2-b">{item.time}</p>
                  )}
                </div>
              ))
            ) : (
              // 운영시간 정보가 없을 때 표시
              <p className="text-aqua-500 p2">{openingHours || '운영시간 정보가 없습니다'}</p>
            )}
          </div>
        </CardContent>
      </Card>
      {/* 소개 */}
      {/* <Card className="p-6">
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <IoDocumentTextOutline className="text-aqua-300 w-4 h-4" />
            <div className="text-aqua-500 h6"> 소개글 </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-aqua-500 p2">소개글 들어오는 곳</p>
        </CardContent>
      </Card> */}
    </div>
  );
}
