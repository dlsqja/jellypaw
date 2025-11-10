import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/headers/Header';
import { Input } from '@/components/ui/input';
import IconText from '@/components/texts/IconText';
import { IoClose } from 'react-icons/io5';
import { LuClock3 } from 'react-icons/lu';
import { IoIosArrowForward } from 'react-icons/io';
import { Spinner } from '@/components/ui/spinner';
import { useSearchStore } from '@/store/searchStore';
import { searchUsers } from '@/services/api/search';
import type { SearchUsersResponse } from '@/types/search';
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;
import { BsPersonCircle } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
// 검색 페이지 컴포넌트
export default function Search() {
  // 검색어 상태
  const [searchValue, setSearchValue] = useState('');
  // 최근 검색 스토어
  const { recentSearches, addSearch, removeSearch, clearSearches } = useSearchStore();
  // 네비게이션 핸들러
  const navigate = useNavigate();

  // 검색 결과 상태
  const [results, setResults] = useState<SearchUsersResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 검색 제출 핸들러
  const normalizeKeyword = (value: string) => value.trim();
  // 검색 타입 추출
  const extractSearchType = (value: string): 'user' | 'place' => (value.startsWith('@') ? 'user' : 'place');
  // 사용자 키워드 정규화
  const sanitizeUserKeyword = (value: string) => value.replace(/^@+/, '');
  // 검색 제출 핸들러
  const handleSubmit = (value: string, type?: 'user' | 'place') => {
    const trimmed = normalizeKeyword(value);
    if (!trimmed) return;
    const searchType = type ?? extractSearchType(trimmed);
    addSearch(trimmed, searchType);
  };

  // 엔터 키 핸들러
  const handleEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit(searchValue);
    }
  };

  const isUserQuery = useMemo(() => normalizeKeyword(searchValue).startsWith('@'), [searchValue]);

  // 검색 결과 조회 (유저만)
  useEffect(() => {
    const normalized = normalizeKeyword(searchValue);
    if (!normalized || !normalized.startsWith('@')) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    // @ 제거 후 조회
    const keyword = sanitizeUserKeyword(normalized);
    if (!keyword) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    // 검색 로딩 시작
    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      searchUsers(keyword)
        .then((users) => {
          const nextResults = users ?? [];
          setResults(nextResults);
          console.log('results:', nextResults);
        })
        .catch((error) => {
          setResults([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchValue]);

  return (
    <>
      <Header title="검색" />
      <div className="flex flex-col gap-3 pb-3">
        <Input
          type="search"
          placeholder="사용자 혹은 장소 검색"
          className="rounded-full placeholder:text-gray-300 placeholder:p2-b"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            console.log('searchValue:', e.target.value);
          }}
          onKeyDown={handleEnter}
        />
        {!searchValue && (
          <div className="flex items-center justify-between">
            <p className="text-gray-500 p2-b">최근 검색</p>
            {recentSearches.length > 0 && (
              <button type="button" className="text-gray-300 caption1 underline" onClick={clearSearches}>
                전체 삭제
              </button>
            )}
          </div>
        )}
        {!searchValue &&
          recentSearches.map((item) => (
            <div key={item.id} className="flex flex-col mb-2">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setSearchValue(item.keyword)}>
                <IconText icon={LuClock3} label={item.keyword} iconTone="gray300" textStyle="p2" textTone="aqua500" />
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeSearch(item.id);
                  }}
                  aria-label="최근 검색 삭제"
                >
                  <IoClose />
                </button>
              </div>
            </div>
          ))}

        {isUserQuery && (
          <div className="flex flex-col gap-3">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full pt-6 gap-3 text-gray-300 p2">
                <Spinner className="size-6 text-aqua-500" />
                <span className="text-gray-300 p2">검색 중...</span>
              </div>
            )}
            {!isLoading && results.length > 0 ? (
              <>
                <p className="text-gray-500 p2-b">검색 결과</p>
                {results.map((result) => (
                  <div
                    key={result.userId}
                    className="w-full h-23 bg-white rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    onClick={() => {
                      handleSubmit(result.nickname || '', 'user');
                      setSearchValue(result.nickname ? `@${result.nickname}` : '');
                      if (result.userId) {
                        navigate(`/search/person/${result.userId}`);
                      }
                    }}
                  >
                    <div className="p-4 w-full h-full flex justify-between items-center cursor-pointer">
                      <div className="flex items-center gap-4">
                        {result.profileImg ? (
                          <img
                            className="w-12 h-12 max-w-12 rounded-full object-cover"
                            src={`${IMAGE_BASE_URL}${result.profileImg}`}
                            alt="프로필 미리보기"
                          />
                        ) : (
                          <BsPersonCircle className="w-12 h-12 text-aqua-300" />
                        )}
                        <div className="flex flex-col">
                          <div className="text-aqua-500 h6-b">{result.nickname}</div>
                          <div className="text-aqua-500 p2 line-clamp-1">{result.description}</div>
                          <div className="text-gray-300 p2-b">팔로워 {result.follower?.toLocaleString() || 0}명</div>
                        </div>
                      </div>
                      <IoIosArrowForward className="text-gray-300 w-3 h-3" />
                    </div>
                  </div>
                ))}
              </>
            ) : null}
            {!isLoading && results.length === 0 && (
              <div className="flex flex-col items-center justify-start h-full pt-10 text-center">
                <p className="text-aqua-500 p2-b">검색 결과가 없습니다</p>
                <p className="text-gray-300 caption1 mt-2">다른 검색어를 입력해보세요</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
