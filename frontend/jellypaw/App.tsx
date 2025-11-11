// App.tsx
import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, AppState, Platform } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import RootNavigator from './src/navigation/RootNavigator';
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnReconnect: true,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// 🔹 SafeArea + 메뉴바/제스처 고려한 Toast 래퍼
function InsetAwareToast() {
  const insets = useSafeAreaInsets();

  return (
    <Toast
      topOffset={insets.top + 16}
      bottomOffset={
        insets.bottom +
        (Platform.OS === 'ios'
          ? 72 // iOS 하단 탭/제스처 여유
          : 64) // Android 하단 여유
      }
    />
  );
}

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const sub = AppState.addEventListener('change', status => {
      focusManager.setFocused(status === 'active');
    });
    return () => sub.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        />
        <RootNavigator />
        <InsetAwareToast />
      </SafeAreaProvider>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
