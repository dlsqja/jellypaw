// src/screens/auth/LoginBridgeScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Button } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/auth/AuthStackNavigator';
import { loginWithKakaoCode } from '../../services/auth/userService';
import { setTokens } from '../../lib/tokenStorage';

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
        const res = await loginWithKakaoCode(code);

        // 1) 회원가입 필요
        if (res.needSignup) {
          if (!res.authId) throw new Error('authId 누락');
          if (!mounted.current) return;
          navigation.replace('SignupWebView', {
            authId: res.authId,
            email: res.email ?? '',
          });
          return;
        }

        // 2) 로그인 완료
        if (!res.accessToken) throw new Error('accessToken 누락');
        await setTokens(res.accessToken);

        if (!mounted.current) return;
        // RootStack 기준으로 메인으로
        navigation.getParent()?.reset({
          index: 0,
          routes: [{ name: 'FeedStack' as never }],
        });
      } catch (e: any) {
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
      {err && (
        <Button
          title="다시 시도"
          onPress={() => navigation.replace('LoginBridge', { code })}
        />
      )}
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
