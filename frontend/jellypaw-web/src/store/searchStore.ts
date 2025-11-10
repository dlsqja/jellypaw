import { create, type StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentSearch {
  id: string;
  keyword: string;
  type: 'user' | 'place';
}

interface SearchState {
  recentSearches: RecentSearch[];
  addSearch: (keyword: string, type?: 'user' | 'place') => void;
  removeSearch: (id: string) => void;
  clearSearches: () => void;
}

const MAX_RECENT = 10;

const searchStore: StateCreator<SearchState> = (set, get) => ({
  // 최근 검색 목록
  recentSearches: [],
  // 최근 검색 추가
  addSearch: (keyword: string, type = 'place') => {
    const raw = keyword.trim();
    if (!raw) {
      return;
    }

    const formatted = type === 'user' ? (raw.startsWith('@') ? raw : `@${raw}`) : raw;
    const { recentSearches } = get();

    const withoutDuplicate = recentSearches.filter((item) => item.keyword !== formatted);
    const newEntry: RecentSearch = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      keyword: formatted,
      type,
    };

    const next = [newEntry, ...withoutDuplicate].slice(0, MAX_RECENT);
    set({ recentSearches: next });
  },
  // 최근 검색 삭제
  removeSearch: (id: string) => {
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
