// src/screens/auth/LoginBridgeScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Button } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/auth/AuthStackNavigator';
import { loginWithKakaoCode } from '../../services/auth/userService';
import { setTokens } from '../../lib/tokenStorage';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import sendFcmToken, { ensureAndroidNotificationPermission } from '../../services/auth/fcm';

type Props = NativeStackScreenProps<AuthStackParamList, 'LoginBridge'>;

export default function LoginBridgeScreen({ route, navigation }: Props) {
  const { code } = route.params;
  const [err, setErr] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    (async () => {
      try {
        setErr(null);
        const res = await loginWithKakaoCode(code); // /auth/kakao?code=

        if (!res) throw new Error('응답이 비어 있습니다.');

        if (res.needSignup) {
          if (!res.authId) throw new Error('authId 누락');
          if (!mounted.current) return;
          navigation.replace('SignupWebView', {
            authId: res.authId,
            email: res.email ?? '',
          });
          return;
        }

        if (!res.accessToken) throw new Error('accessToken 누락');
        await setTokens(res.accessToken, res.refreshToken ?? null);

        // 로그인 성공 시 FCM 토큰 발급 및 로그 출력
        try {
          const messaging = getMessaging();
          // FCM 토큰 발급
          const fcmToken = await getToken(messaging);

          // FCM 토큰 서버 전송
          await sendFcmToken(fcmToken as string);
        } catch (error) {
          console.log('[FCM Token Error :: ', error);
        }

        // 피드화면 이동 전에 안드로이드 알림 권한 확인 + 요청
        await ensureAndroidNotificationPermission();

        if (!mounted.current) return;
        navigation.getParent()?.reset({
          index: 0,
          routes: [{ name: 'FeedStack' as never }],
        });
      } catch (e: any) {
        console.log('[LoginBridge] error', e);
        if (!mounted.current) return;
        setErr(e?.message || '로그인 처리 중 오류가 발생했습니다.');
      }
    })();

    return () => {
      mounted.current = false;
    };
  }, [code, navigation]);

  return (
    <View style={S.root}>
      <ActivityIndicator size="large" />
      <Text style={S.msg}>{err ?? '로그인 중입니다...'}</Text>
      {err && <Button title="다시 시도" onPress={() => navigation.replace('LoginBridge', { code })} />}
    </View>
  );
}

const S = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    gap: 12,
  },
  msg: { color: '#374151', fontSize: 14 },
});
