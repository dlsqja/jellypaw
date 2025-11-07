// App.tsx
import React, {useEffect} from 'react';
import { StatusBar, useColorScheme, AppState, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator'; 
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // “하이브리드” 전략: 즉시 캐시 보여주고, 포커스시 재검증
      staleTime: 60 * 1000,         // 1분 동안 신선
      gcTime: 5 * 60 * 1000,        // 5분 후 가비지컬렉션
      refetchOnReconnect: true,
      refetchOnMount: false,
      refetchOnWindowFocus: true,   // RN에서도 focusManager로 동작
      retry: 1,
    },
  },
});

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  // RN 포커스 연동은 이 안에서 등록/정리
  useEffect(() => {
    const sub = AppState.addEventListener('change', (status) => {
      focusManager.setFocused(status === 'active');
    });
    return () => sub.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <RootNavigator />
      </SafeAreaProvider>

      {/* (선택) 개발 중 캐시 상태 보려면 켜두세요 */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}