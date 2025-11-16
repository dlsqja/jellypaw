// src/screens/auth/AppGateScreen.tsx
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { getAccessToken, clearTokens } from '../../lib/tokenStorage';
import { DeviceEventEmitter } from 'react-native';
import apiClient from '../../lib/apiClient';

type Props = NativeStackScreenProps<RootStackParamList>;

export default function AppGateScreen({ navigation }: Props) {
  useEffect(() => {
    let mounted = true;

    const goFeed = () =>
      navigation.reset({ index: 0, routes: [{ name: 'FeedStack' as never }] });
    const goLogin = () =>
      navigation.reset({ index: 0, routes: [{ name: 'AuthStack' as never }] });

    const bootstrap = async () => {
      try {
        const token = await getAccessToken();
        if (!token) return goLogin();

        // 토큰이 있으면 짧게 유효성 확인 (필요 시 /users/profile)
        try {
          await apiClient.get('/users/profile');
          if (!mounted) return;
          return goFeed();
        } catch (e: any) {
          // 401 등 무효 → 클린업 후 로그인으로
          await clearTokens();
          if (!mounted) return;
          return goLogin();
        }
      } catch {
        return goLogin();
      }
    };

    bootstrap();

    // 토큰 변동(로그인/로그아웃) 시에도 동일한 라우팅 일관성 유지
    const sub = DeviceEventEmitter.addListener('AUTH_CHANGED', bootstrap);

    return () => {
      mounted = false;
      sub.remove();
    };
  }, [navigation]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
