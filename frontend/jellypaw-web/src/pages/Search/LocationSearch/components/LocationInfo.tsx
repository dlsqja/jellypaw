import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { FiClock } from 'react-icons/fi';
import { IoDocumentTextOutline } from 'react-icons/io5';

interface LocationInfoProps {
  runningTime: { id: number; name: string; start: string | '휴무'; end: string | '휴무' }[];
  description: string;
}

export default function LocationInfo({ runningTime, description }: LocationInfoProps) {
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
            <div className="flex flex-col gap-2">
              {runningTime.map((time) => (
                <div key={time.id}>
                  <div className="flex justify-between">
                    <p className="text-aqua-500 p2">{time.name}</p>
                    {time.start === '휴무' ? (
                      <p className="text-pink-400 p2-b">휴무</p>
                    ) : (
                      <p className="text-aqua-500 p2-b">
                        {time.start} - {time.end}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* 소개 */}
      <Card className="p-6">
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <IoDocumentTextOutline className="text-aqua-300 w-4 h-4" />
            <div className="text-aqua-500 h6"> 소개글 </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-aqua-500 p2">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
}
