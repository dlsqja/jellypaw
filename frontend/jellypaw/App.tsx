// App.tsx
import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, AppState, Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import RootNavigator from './src/navigation/RootNavigator';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { getMessaging, onMessage } from '@react-native-firebase/messaging';

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

// SafeArea + 메뉴바/제스처 고려한 Toast 래퍼
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
    const sub = AppState.addEventListener('change', (status) => {
      focusManager.setFocused(status === 'active');
    });
    return () => sub.remove();
  }, []);

  // FCM 포그라운드 메시지 수신 (modular API)
  // 앱이 켜져 있으면 토스트 (인앱) 알람, 백그라운드 / 앱 종료 상태에선 시스템 알람
  useEffect(() => {
    // FCM 모듈 초기화
    const messaging = getMessaging();

    // FCM 메시지 수신
    const unsubscribeOnMessage = onMessage(messaging, async (remoteMessage: any) => {
      console.log('[FCM] Remote Message ', JSON.stringify(remoteMessage));

      const { notification, data } = remoteMessage || {};

      // 알림 타입은 구분하지 않고, 제목/본문만 토스트로 노출
      if (notification?.title || notification?.body) {
        Toast.show({
          type: 'info',
          text1: notification?.title ?? '새 알림',
          text2: notification?.body,
        });
      }
    });

    // FCM 메시지 수신 해제
    return () => {
      unsubscribeOnMessage();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* SafeAreaProvider : 안드로이드 상단 표시영역 처리 */}
      <SafeAreaProvider>
        {/* StatusBar : 상단 상태바 처리 */}
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        {/* RootNavigator : 루트 네비게이터 */}
        <RootNavigator />
        {/* InsetAwareToast : 토스트 메시지 처리 */}
        <InsetAwareToast />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
