import { useEffect, useMemo, useRef, useState } from 'react';
import Header from '@/components/headers/Header';
import { Input } from '@/components/ui/input';
import IconText from '@/components/texts/IconText';
import { IoClose } from 'react-icons/io5';
import { LuClock3 } from 'react-icons/lu';
import { IoIosArrowForward } from 'react-icons/io';
import { Spinner } from '@/components/ui/spinner';
import { useSearchStore } from '@/store/searchStore';
import { searchPlaces, searchUsers, searchUsersWithCursor, searchPlacesWithCursor } from '@/services/api/search';
import type { SearchPlacesResponse, SearchUsersResponse } from '@/types/search';
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
  const [placeResults, setPlaceResults] = useState<SearchPlacesResponse['places']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const skipNextSearchRef = useRef(0);
  const [placeCursor, setPlaceCursor] = useState<number | null>(null); // 장소 검색용 cursor
  const [userCursor, setUserCursor] = useState<number | null>(null); // 유저 검색용 cursor
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [hasMorePlaces, setHasMorePlaces] = useState(true);
  // 검색어 공백 제거
  const removeblank = (keyword: string) => keyword.trim();
  // 검색 타입 추출 - @ 유저명 혹은 장소명 판별
  const extractSearchType = (keyword: string): 'user' | 'place' => (keyword.startsWith('@') ? 'user' : 'place');
  // 사용자 키워드 정규화
  const sanitizeUserKeyword = (keyword: string) => keyword.replace(/^@+/, '');

  // 검색어 제출
  const handleSubmit = (keyword: string, type?: 'user' | 'place') => {
    // 검색어 공백 제거
    const removedBlankKeyword = removeblank(keyword);
    if (!removedBlankKeyword) return;
    // 검색 타입 추출 - @ 유저명 혹은 장소명 판별
    const searchType = type ?? extractSearchType(removedBlankKeyword);
    addSearch(removedBlankKeyword, searchType);
  };

  const removedBlankSearchValue = useMemo(() => removeblank(searchValue), [searchValue]);
  // @ 유저명 혹은 장소명 판별
  const isUserQuery = useMemo(() => removedBlankSearchValue.startsWith('@'), [removedBlankSearchValue]);
  const hasKeyword = removedBlankSearchValue.length > 0;

  // 검색 요청 (첫 검색만 - userCursor === null일 때만)
  useEffect(() => {
    // 다음 검색 건너뛰기
    if (skipNextSearchRef.current > 0) {
      skipNextSearchRef.current -= 1;
      return;
    }

    // 검색어 없으면 초기화
    if (!removedBlankSearchValue) {
      setResults([]);
      setPlaceResults([]);
      setIsLoading(false);
      setPlaceCursor(null);
      setUserCursor(null);
      setHasMoreUsers(true);
      setHasMorePlaces(true);
      return;
    }

    // 검색 타입 추출
    const searchType = extractSearchType(removedBlankSearchValue);
    
    // 유저 검색: userCursor가 null이 아니면 첫 검색이 아니므로 이 useEffect에서는 처리하지 않음
    if (searchType === 'user' && userCursor !== null) {
      return;
    }
    
    // 장소 검색: placeCursor가 null이 아니면 첫 검색이 아니므로 이 useEffect에서는 처리하지 않음
    if (searchType === 'place' && placeCursor !== null) {
      return;
    }
    
    // 유저 검색: 첫 검색이 아니고 더 이상 데이터가 없으면 중단
    if (searchType === 'user' && userCursor === null && !hasMoreUsers && results.length > 0) {
      setIsLoading(false);
      setIsLoadingMore(false);
      return;
    }
    
    // 장소 검색: 첫 검색이 아니고 더 이상 데이터가 없으면 중단
    if (searchType === 'place' && placeCursor === null && !hasMorePlaces && placeResults && placeResults.length > 0) {
      setIsLoading(false);
      setIsLoadingMore(false);
      return;
    }
    
    // 로딩 상태 설정
    setIsLoading(true);
    // 검색 요청 타임아웃
    const timeoutId = setTimeout(() => {
      // 유저 검색 요청
      if (searchType === 'user') {
        // 유저 검색어 @이후 값 추출
        const keyword = sanitizeUserKeyword(removedBlankSearchValue);
        // 유저 검색어 없으면 초기화
        if (!keyword) {
          setResults([]);
          setIsLoading(false);
          setUserCursor(null);
          setHasMoreUsers(true);
          return;
        }

        // 유저 검색 요청 (첫 검색만 - cursor: null)
        searchUsersWithCursor({ nickname: keyword, cursor: null })
          .then((response) => {
            const userResults = response.users ?? [];
            // 첫 검색: 결과 교체
            setResults(userResults);
            setPlaceResults([]);
            
            // nextCursor 업데이트
            if (response.nextCursor === null) {
              setHasMoreUsers(false);
              setUserCursor(null);
            } else {
              setHasMoreUsers(true);
              setUserCursor(response.nextCursor);
            }
            console.log('[Search] 첫 검색 results:', userResults, 'nextCursor:', response.nextCursor);
          })
          .catch((error) => {
            console.log(error);
            setResults([]);
            setHasMoreUsers(false);
            setUserCursor(null);
          })
          .finally(() => {
            setIsLoading(false);
          });

        // 장소 검색 요청 (첫 검색만 - cursor: null)
      } else {
        searchPlacesWithCursor({ title: removedBlankSearchValue, cursor: null })
          .then((response) => {
            const placeResults = response.places ?? [];
            // 첫 검색: 결과 교체
            setPlaceResults(placeResults);
            setResults([]);
            
            // nextCursor 업데이트
            if (response.nextCursor === null) {
              setHasMorePlaces(false);
              setPlaceCursor(null);
            } else {
              setHasMorePlaces(true);
              setPlaceCursor(response.nextCursor);
            }
            console.log('[Search] 첫 검색 places:', placeResults, 'nextCursor:', response.nextCursor);
          })
          .catch((error) => {
            console.log('[Search] 장소 검색 오류:', error);
            setPlaceResults([]);
            setHasMorePlaces(false);
            setPlaceCursor(null);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [removedBlankSearchValue]); // placeCursor, userCursor 제거 - 첫 검색만 처리

  // 무한 스크롤: 유저 검색 - 스크롤 이벤트로 추가 데이터 로드
  useEffect(() => {
    // 유저 검색이 아니거나 더 이상 불러올 데이터가 없으면 리턴
    if (!isUserQuery || !hasMoreUsers || !removedBlankSearchValue || userCursor === null || results.length === 0) {
      return;
    }

    const container = document.getElementById('app-scroll-container');
    if (!container) {
      return;
    }

    const handleScroll = () => {
      // 이미 로딩 중이면 리턴
      if (isLoadingMore || isLoading) {
        return;
      }

      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const scrollBottom = scrollHeight - scrollTop - clientHeight;

      // 스크롤이 하단 200px 이내에 도달했을 때
      if (scrollBottom < 200) {
        const keyword = sanitizeUserKeyword(removedBlankSearchValue);
        if (!keyword) {
          return;
        }

        setIsLoadingMore(true);

        searchUsersWithCursor({ nickname: keyword, cursor: userCursor })
          .then((response) => {
            const userResults = response.users ?? [];
            setResults((prev) => [...prev, ...userResults]);
            
            // nextCursor 업데이트
            if (response.nextCursor === null) {
              setHasMoreUsers(false);
              setUserCursor(null);
            } else {
              setUserCursor(response.nextCursor);
            }
            console.log('[Search] 유저 추가 로드 results:', userResults, 'nextCursor:', response.nextCursor);
          })
          .catch((error) => {
            console.log('[Search] 유저 추가 로드 실패:', error);
            setHasMoreUsers(false);
            setUserCursor(null);
          })
          .finally(() => {
            setIsLoadingMore(false);
          });
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isUserQuery, hasMoreUsers, removedBlankSearchValue, userCursor, results.length, isLoadingMore, isLoading]);

  // 무한 스크롤: 장소 검색 - 스크롤 이벤트로 추가 데이터 로드
  useEffect(() => {
    // 장소 검색이 아니거나 더 이상 불러올 데이터가 없으면 리턴
    if (isUserQuery || !hasMorePlaces || !removedBlankSearchValue || placeCursor === null || !placeResults || placeResults.length === 0) {
      return;
    }

    const container = document.getElementById('app-scroll-container');
    if (!container) {
      return;
    }

    const handleScroll = () => {
      // 이미 로딩 중이면 리턴
      if (isLoadingMore || isLoading) {
        return;
      }

      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const scrollBottom = scrollHeight - scrollTop - clientHeight;

      // 스크롤이 하단 200px 이내에 도달했을 때
      if (scrollBottom < 200) {
        setIsLoadingMore(true);

        searchPlacesWithCursor({ title: removedBlankSearchValue, cursor: placeCursor })
          .then((response) => {
            const placeResults = response.places ?? [];
            setPlaceResults((prev) => [...(prev || []), ...placeResults]);
            
            // nextCursor 업데이트
            if (response.nextCursor === null) {
              setHasMorePlaces(false);
              setPlaceCursor(null);
            } else {
              setPlaceCursor(response.nextCursor);
            }
            console.log('[Search] 장소 추가 로드 places:', placeResults, 'nextCursor:', response.nextCursor);
          })
          .catch((error) => {
            console.log('[Search] 장소 추가 로드 실패:', error);
            setHasMorePlaces(false);
            setPlaceCursor(null);
          })
          .finally(() => {
            setIsLoadingMore(false);
          });
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isUserQuery, hasMorePlaces, removedBlankSearchValue, placeCursor, placeResults?.length ?? 0, isLoadingMore, isLoading]);

  return (
    <>
      <Header title="검색" />
      <div className="flex flex-col gap-3 pb-3">
        <Input
          type="search"
          placeholder="@유저명 혹은 장소명을 입력해주세요"
          className="rounded-full p2-b placeholder:text-gray-300 placeholder:p2"
          value={searchValue}
          onChange={(e) => {
            skipNextSearchRef.current = 0;
            setSearchValue(e.target.value);
            setPlaceCursor(null);
            setUserCursor(null);
            setHasMoreUsers(true);
            setHasMorePlaces(true);
            setResults([]);
            setPlaceResults([]);
          }}
        />
        {!hasKeyword && (
          <div className="flex items-center justify-between">
            <p className="text-gray-500 p2-b">최근 검색</p>
          </div>
        )}
        {!hasKeyword &&
          recentSearches.map((item) => (
            <div key={item.id} className="flex flex-col mb-2">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => {
                  skipNextSearchRef.current = 0;
                  setPlaceCursor(null);
                  setUserCursor(null);
                  setHasMoreUsers(true);
                  setHasMorePlaces(true);
                  setSearchValue(item.keyword);
                }}
              >
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
        {!hasKeyword && recentSearches.length > 0 && (
          <div className="mt-1 flex justify-center">
            <button type="button" className="text-gray-300 caption1" onClick={clearSearches}>
              최근 검색 히스토리 삭제
            </button>
          </div>
        )}

        {hasKeyword && (
          <div className="flex flex-col gap-3">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full pt-6 gap-3 text-gray-300 p2">
                <Spinner className="size-6 text-aqua-500" />
                <span className="text-gray-300 p2">검색 중...</span>
              </div>
            )}
            {!isLoading && isUserQuery && results.length > 0 && (
              <>
                {/* 유저 검색 결과 */}
                <p className="text-gray-500 p2-b">검색 결과</p>
                {results.map((result) => (
                  <div
                    key={result.userId}
                    className="w-full h-23 bg-white rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    onClick={() => {
                      if (!result.userId) {
                        return;
                      }
                      skipNextSearchRef.current = 2;
                      handleSubmit(result.nickname || '', 'user');
                      setSearchValue(result.nickname ? `@${result.nickname}` : '');
                      // 검색 결과를 state로 전달하여 초기 데이터로 사용
                      navigate(`/search/person/${result.userId}`, {
                        state: {
                          searchResult: result, // 검색 결과를 state로 전달
                        },
                      });
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
                {/* 무한 스크롤 로딩 인디케이터 */}
                {isLoadingMore && (
                  <div className="flex flex-col items-center justify-center py-4 gap-2">
                    <Spinner className="size-5 text-aqua-500" />
                    <span className="text-gray-300 caption1">더 불러오는 중...</span>
                  </div>
                )}
              </>
            )}

            {/* 장소 검색 결과 */}
            {!isLoading && !isUserQuery && placeResults && placeResults.length > 0 && (
              <>
                <p className="text-gray-500 p2-b">검색 결과</p>
                {placeResults.map((place) => (
                  <div
                    key={place.id}
                    className="w-full bg-white rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    onClick={() => {
                      skipNextSearchRef.current = 2;
                      handleSubmit(place.title || '', 'place');
                      navigate(`/search/location/${place.id}`);
                    }}
                  >
                    <div className="p-4 w-full h-full flex justify-between gap-3 items-center cursor-pointer">
                      <div className="flex flex-col gap-1">
                        <span className="text-aqua-500 h6-b">{place.title}</span>
                        <span className="text-gray-500 p2 line-clamp-1">{place.address}</span>
                        <span className="text-gray-300 caption1">{place.phoneNumber || '연락처 정보 없음'}</span>
                      </div>
                      <IoIosArrowForward className="text-gray-300 w-3 h-3" />
                    </div>
                  </div>
                ))}
                {/* 무한 스크롤 로딩 인디케이터 */}
                {isLoadingMore && (
                  <div className="flex flex-col items-center justify-center py-4 gap-2">
                    <Spinner className="size-5 text-aqua-500" />
                    <span className="text-gray-300 caption1">더 불러오는 중...</span>
                  </div>
                )}
              </>
            )}

            {!isLoading && ((isUserQuery && results.length === 0) || (!isUserQuery && placeResults && placeResults.length === 0)) && (
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
