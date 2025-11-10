import { create, type StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentSearch {
  id: number;
  keyword: string;
  type: 'user' | 'place';
  searchedAt: number;
}

interface SearchState {
  recentSearches: RecentSearch[];
  addSearch: (keyword: string, type?: 'user' | 'place') => void;
  removeSearch: (id: number) => void;
  clearSearches: () => void;
}

const MAX_RECENT = 10;

const searchStore: StateCreator<SearchState> = (set, get) => ({
  // 최근 검색 목록
  recentSearches: [],
  // 최근 검색 추가
  addSearch: (keyword: string, type = 'place') => {
    const raw: string = keyword.trim();
    if (!raw) {
      return;
    }
    // 최근 검색 형식 변환
    const formatted = type === 'user' ? (raw.startsWith('@') ? raw : `@${raw}`) : raw;
    const { recentSearches } = get();
    // 중복 제거
    const withoutDuplicate = recentSearches.filter((item) => item.keyword !== formatted);
    // 새 검색 추가
    const newEntry: RecentSearch = {
      id: Date.now(),
      keyword: formatted,
      type,
      searchedAt: Date.now(),
    };
    // 최근 검색 목록 업데이트
    const next = [newEntry, ...withoutDuplicate].slice(0, MAX_RECENT);
    set({ recentSearches: next });
  },
  // 최근 검색 삭제
  removeSearch: (id: number) => {
    set((state) => ({
      ...state,
      recentSearches: state.recentSearches.filter((item) => item.id !== id),
    }));
  },
  // 최근 검색 초기화
  clearSearches: () => {
    set((state) => ({
      ...state,
      recentSearches: [],
    }));
  },
});

export const useSearchStore = create<SearchState>()(
  persist(searchStore, {
    name: 'search-store',
    partialize: (state) => ({
      recentSearches: state.recentSearches,
    }),
  }),
);
