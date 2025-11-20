// App.tsx
import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, AppState, Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import RootNavigator from './src/navigation/RootNavigator';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { getMessaging, onMessage } from '@react-native-firebase/messaging';
import { navigationRef } from './src/navigation/navigationRef';
import { CommonActions } from '@react-navigation/native';

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

      // 분석 완료 알림인지 확인 (data에 analysisId와 petId가 있는 경우)
      if (data?.analysisId && data?.petId) {
        console.log('[FCM] 분석 완료 알림 수신', { analysisId: data.analysisId, petId: data.petId });
        
        // 토스트 메시지 표시
        Toast.show({
          type: 'success',
          text1: notification?.title ?? '분석 완료',
          text2: notification?.body ?? '소변 검사 분석이 완료되었습니다.',
          onPress: () => {
            // 토스트 클릭 시 결과 화면으로 이동
            navigateToResultSummary(data.analysisId, data.petId);
          },
        });

        // 2초 후 자동으로 결과 화면으로 이동
        setTimeout(() => {
          navigateToResultSummary(data.analysisId, data.petId);
        }, 2000);
      } else {
        // 일반 알림은 토스트로만 표시
        if (notification?.title || notification?.body) {
          Toast.show({
            type: 'info',
            text1: notification?.title ?? '새 알림',
            text2: notification?.body,
          });
        }
      }
    });

    // 결과 화면으로 이동하는 헬퍼 함수
    const navigateToResultSummary = (analysisId: string, petId: string) => {
      if (!navigationRef.isReady()) {
        console.log('[FCM] Navigation not ready, retrying...');
        setTimeout(() => navigateToResultSummary(analysisId, petId), 500);
        return;
      }

      try {
        navigationRef.dispatch(
          CommonActions.navigate({
            name: 'PetStack',
            params: {
              screen: 'ResultSummary',
              params: {
                analysisId,
                petId: parseInt(petId, 10),
              },
            },
          }),
        );
      } catch (error) {
        console.error('[FCM] Navigation error:', error);
      }
    };

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
