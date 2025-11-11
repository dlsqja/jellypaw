import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { FiClock } from 'react-icons/fi';
import { IoDocumentTextOutline } from 'react-icons/io5';

interface LocationInfoProps {
  openingHours: string;
}

// 운영시간 문자열을 쉼표 기준으로 요일별로 파싱하는 함수
const parseOpeningHours = (openingHours: string): { day: string; time: string }[] => {
  if (!openingHours || !openingHours.trim()) {
    return [];
  }

  // 쉼표로 구분
  const lines = openingHours
    .split(',')
    .map((line) => line.trim())
    .filter((line) => line);

  return lines.map((line) => {
    // "요일: 시간" 형식에서 요일과 시간 분리
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const day = line.substring(0, colonIndex).trim();
      const time = line.substring(colonIndex + 1).trim();

      return {
        day,
        time: time || '정보 없음',
      };
    }
    // 콜론이 없는 경우 전체를 시간으로 처리
    return {
      day: '운영시간',
      time: line,
    };
  });
};

export default function LocationInfo({ openingHours }: LocationInfoProps) {
  const parsedHours = parseOpeningHours(openingHours);

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

            {parsedHours.length > 0 ? (
              // 요일별 운영시간 표시
              parsedHours.map((item, index) => (
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
