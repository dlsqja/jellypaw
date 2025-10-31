import { useState } from 'react';
import BackHeader from '@/components/headers/BackHeader';
import { Input } from '@/components/ui/input';
import IconText from '@/components/texts/IconText';
import { IoClose } from 'react-icons/io5';
import { LuClock3 } from 'react-icons/lu';
import { IoIosArrowForward } from 'react-icons/io';
// 최근 검색
const recentSearch = [
  {
    id: 1,
    name: '한강공원',
  },
  {
    id: 2,
    name: '펫카페',
  },
  {
    id: 3,
    name: '동물병원',
  },
  {
    id: 4,
    name: '@멍멍이엄마',
  },
  {
    id: 5,
    name: '@미료 언니',
  },
];

// 검색 결과
const allResults = [
  { id: 101, name: '한강공원', image: '/src/assets/search/person1.png', description: '한강공원입니다', follower: 10 },
  { id: 102, name: '펫카페 홍대점', image: '/src/assets/search/person1.png', description: '펫카페 홍대점입니다  ', follower: 10 },
  { id: 103, name: '동물병원 강남', image: '/src/assets/search/person1.png', description: '동물병원 강남입니다', follower: 120 },
  { id: 104, name: '@멍멍이엄마', image: '/src/assets/search/person1.png', description: '멍멍이엄마입니다', follower: 1240 },
  { id: 105, name: '@미료 언니', image: '/src/assets/search/person1.png', description: '미료 언니입니다', follower: 10 },
  { id: 106, name: '한강 수영장1', image: '/src/assets/search/person1.png', description: '한강 수영장1입니다', follower: 1240 },
  { id: 107, name: '한강 수영장2', image: '/src/assets/search/person1.png', description: '한강 수영장2입니다', follower: 12340 },
  { id: 108, name: '한강 수영장3', image: '/src/assets/search/person1.png', description: '한강 수영장3입니다', follower: 12240 },
];

export default function Search() {
  const [searchValue, setSearchValue] = useState('');
  const results = allResults.filter((r) => r.name.toLowerCase().includes(searchValue.toLowerCase()));
  return (
    <>
      <BackHeader title="" />
      <div className="flex flex-col gap-3 pb-3">
        <Input
          type="search"
          placeholder="사용자 혹은 장소 검색"
          className="rounded-full placeholder:text-gray-300 placeholder:p2-b"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <p className="text-gray-500 p2-b">{searchValue ? '검색 결과' : '최근 검색'}</p>
        {!searchValue &&
          recentSearch.map((item) => (
            <div key={item.id} className="flex flex-col mb-2">
              <div className="flex justify-between items-center cursor-pointer">
                <IconText icon={LuClock3} label={item.name} iconTone="gray300" textStyle="p2" textTone="aqua500" />
                <IoClose />
              </div>
            </div>
          ))}

        {searchValue && (
          <div className="flex flex-col gap-3">
            {results.map((result) => (
              <div key={result.id} className="w-full h-23 bg-white rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <div className="p-4 w-full h-full flex justify-between items-center cursor-pointer">
                  <div className="flex items-center gap-4">
                    <img className="w-12 h-12 max-w-12 rounded-full" src={result.image} />
                    <div className="flex flex-col">
                      <div className="text-aqua-500 h6-b">{result.name}</div>
                      <div className="text-aqua-500 p2">{result.description}</div>
                      <div className="text-gray-300 caption1">팔로워 {result.follower.toLocaleString()}명</div>
                    </div>
                  </div>
                  <IoIosArrowForward className="text-gray-300 w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
