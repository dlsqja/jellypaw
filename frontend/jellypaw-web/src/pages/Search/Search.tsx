import { useEffect, useMemo, useRef, useState, useLayoutEffect, useCallback } from 'react';
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
import { useNavigate, useLocation } from 'react-router-dom';

const SEARCH_STATE_KEY = 'search-state';
export const SEARCH_SCROLL_KEY = 'search-scroll-top';

// 검색 페이지 컴포넌트
export default function Search() {
  // 검색어 상태
  const [searchValue, setSearchValue] = useState('');
  // 최근 검색 스토어
  const { recentSearches, addSearch, removeSearch, clearSearches } = useSearchStore();
  // 네비게이션 핸들러
  const navigate = useNavigate();
  const location = useLocation();

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
  const restoredRef = useRef(false);
  const scrollRestoredRef = useRef(false);
  // 검색어 공백 제거
  const removeblank = (keyword: string) => keyword.trim();
  // 검색 타입 추출 - @ 유저명 혹은 장소명 판별
  const extractSearchType = (keyword: string): 'user' | 'place' => (keyword.startsWith('@') ? 'user' : 'place');
  // 사용자 키워드 정규화
  const sanitizeUserKeyword = (keyword: string) => keyword.replace(/^@+/, '');

  // 검색 상태를 sessionStorage에 저장 (useCallback으로 최신 state 참조 보장)
  const saveSearchState = useCallback(() => {
    const state = {
      searchValue,
      results,
      placeResults,
      userCursor,
      placeCursor,
      hasMoreUsers,
      hasMorePlaces,
    };
    window.sessionStorage.setItem(SEARCH_STATE_KEY, JSON.stringify(state));
  }, [searchValue, results, placeResults, userCursor, placeCursor, hasMoreUsers, hasMorePlaces]);

  // 검색 상태를 sessionStorage에서 복원
  const restoreSearchState = () => {
    if (restoredRef.current) return;
    
    const saved = window.sessionStorage.getItem(SEARCH_STATE_KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        // 복원 중에는 검색을 건너뛰도록 설정 (복원 후 검색 useEffect가 실행되지 않도록)
        skipNextSearchRef.current = 10; // 충분히 큰 값으로 설정하여 복원 중 검색 방지
        setSearchValue(state.searchValue || '');
        setResults(state.results || []);
        setPlaceResults(state.placeResults || []);
        setUserCursor(state.userCursor ?? null);
        setPlaceCursor(state.placeCursor ?? null);
        setHasMoreUsers(state.hasMoreUsers ?? true);
        setHasMorePlaces(state.hasMorePlaces ?? true);
        restoredRef.current = true;
        // 스크롤 복원 ref 리셋 (스크롤 복원이 실행되도록)
        scrollRestoredRef.current = false;
        console.log('[Search] 검색 상태 복원:', state);
        // 복원 완료 후 skipNextSearchRef 리셋 (다음 검색은 정상적으로 작동하도록)
        setTimeout(() => {
          skipNextSearchRef.current = 0;
        }, 100);
      } catch (error) {
        console.error('[Search] 검색 상태 복원 실패:', error);
        skipNextSearchRef.current = 0;
      }
    }
  };

  // 검색 상태 복원 (페이지 로드 시)
  useEffect(() => {
    // 뒤로가기로 돌아온 경우에만 복원
    if (location.state?.fromDetail) {
      restoreSearchState();
    }
  }, [location.state]);

  // 스크롤 위치 복원 (검색 결과가 로드된 후)
  useLayoutEffect(() => {
    const container = document.getElementById('app-scroll-container');

    // 스크롤 컨테이너가 없으면 리턴
    if (!container) {
      return;
    }

    // 뒤로가기로 돌아온 경우가 아니면 리턴
    if (!location.state?.fromDetail) {
      return;
    }

    // 아직 검색 결과가 로드 중이면 리턴
    if (isLoading) {
      return;
    }

    // 검색 결과가 없으면 리턴
    const hasResults = results.length > 0 || (placeResults && placeResults.length > 0);
    if (!hasResults) {
      scrollRestoredRef.current = true;
      return;
    }

    // 이미 스크롤을 복원했으면 리턴
    if (scrollRestoredRef.current) {
      return;
    }

    // 스크롤 위치 복원
    const raw = window.sessionStorage.getItem(SEARCH_SCROLL_KEY);
    const saved = raw ? Number(raw) : 0;

    if (!Number.isNaN(saved) && saved > 0) {
      container.scrollTo({ top: saved, left: 0, behavior: 'auto' });
      console.log('[Search] 스크롤 위치 복원:', saved);
    }

    scrollRestoredRef.current = true;
  }, [isLoading, results.length, placeResults?.length ?? 0, location.state?.fromDetail]);

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

    // 복원 중이거나 복원된 상태에서는 검색을 실행하지 않음
    // (복원된 상태에서는 이미 results나 placeResults가 있고, cursor도 설정되어 있음)
    if (restoredRef.current && (results.length > 0 || (placeResults && placeResults.length > 0))) {
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
            // 검색 상태 저장
            setTimeout(() => {
              saveSearchState();
            }, 0);
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
            // 검색 상태 저장
            setTimeout(() => {
              saveSearchState();
            }, 0);
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
            // 중복 제거: 기존 결과에 없는 항목만 추가
            setResults((prev) => {
              const existingIds = new Set(prev.map((r) => r.userId));
              const newResults = userResults.filter((r) => !existingIds.has(r.userId));
              return [...prev, ...newResults];
            });
            
            // nextCursor 업데이트
            if (response.nextCursor === null) {
              setHasMoreUsers(false);
              setUserCursor(null);
            } else {
              setUserCursor(response.nextCursor);
            }
            console.log('[Search] 유저 추가 로드 results:', userResults, 'nextCursor:', response.nextCursor);
            // 검색 상태 저장
            setTimeout(() => {
              saveSearchState();
            }, 0);
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
            // 중복 제거: 기존 결과에 없는 항목만 추가
            setPlaceResults((prev) => {
              const existingIds = new Set((prev || []).map((p) => p.id));
              const newResults = placeResults.filter((p) => !existingIds.has(p.id));
              return [...(prev || []), ...newResults];
            });
            
            // nextCursor 업데이트
            if (response.nextCursor === null) {
              setHasMorePlaces(false);
              setPlaceCursor(null);
            } else {
              setPlaceCursor(response.nextCursor);
            }
            console.log('[Search] 장소 추가 로드 places:', placeResults, 'nextCursor:', response.nextCursor);
            // 검색 상태 저장
            setTimeout(() => {
              saveSearchState();
            }, 0);
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
            const newValue = e.target.value;
            setSearchValue(newValue);
            setPlaceCursor(null);
            setUserCursor(null);
            setHasMoreUsers(true);
            setHasMorePlaces(true);
            setResults([]);
            setPlaceResults([]);
            // 검색어 변경 시 저장된 상태 초기화 및 복원 상태 리셋
            window.sessionStorage.removeItem(SEARCH_STATE_KEY);
            window.sessionStorage.removeItem(SEARCH_SCROLL_KEY);
            restoredRef.current = false;
            scrollRestoredRef.current = false;
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
                      // 스크롤 위치 저장
                      const container = document.getElementById('app-scroll-container');
                      if (container) {
                        window.sessionStorage.setItem(SEARCH_SCROLL_KEY, String(container.scrollTop));
                      }
                      // 검색 상태 저장 (원래 검색어 유지)
                      saveSearchState();
                      skipNextSearchRef.current = 2;
                      // 검색어는 변경하지 않음 (원래 검색어 유지)
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
                      // 스크롤 위치 저장
                      const container = document.getElementById('app-scroll-container');
                      if (container) {
                        window.sessionStorage.setItem(SEARCH_SCROLL_KEY, String(container.scrollTop));
                      }
                      // 검색 상태 저장 (원래 검색어 유지)
                      saveSearchState();
                      skipNextSearchRef.current = 2;
                      // 검색어는 변경하지 않음 (원래 검색어 유지)
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
