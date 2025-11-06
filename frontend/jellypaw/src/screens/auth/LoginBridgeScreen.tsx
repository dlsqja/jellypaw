// src/screens/auth/LoginBridgeScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet, Button } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
// TODO: 실제 네비게이션 타입으로 교체
type AuthStackParamList = {
  LoginBridge: { code: string };
  SignupWebView: { webUrl: string };
  FeedStack: undefined;
};
type Props = NativeStackScreenProps<AuthStackParamList, "LoginBridge">;

// 토큰 보관 유틸 (예시)
let accessToken: string | null = null;
const setAccessToken = (t: string | null) => (accessToken = t);
// refresh는 SecureStorage 권장 (react-native-keychain / expo-secure-store 등)
async function saveRefreshTokenSecurely(refreshToken?: string) {
  /* await Keychain.setGenericPassword('refresh', refreshToken ?? '', { service: 'refresh-token' }); */
}

const api = axios.create({
  baseURL: "http://localhost:8888/api", // 실제 값으로 교체
  timeout: 15000,
});

export default function LoginBridgeScreen({ route, navigation }: Props) {
  const { code } = route.params;
  const [err, setErr] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        setErr(null);

        // 1) 카카오 로그인 처리 (리다이렉트 없음, JSON만)
        const res = await api.post(`/auth/kakao`, null, { params: { code } });
        const data = res.data?.data as {
          needSignup: boolean;
          accessToken?: string;
          refreshToken?: string;
          authId?: string;
          email?: string;
        };

        if (!data) throw new Error("Empty response");

        if (!data.needSignup) {
          // 2-A) 기존 회원: 토큰 저장 후 홈 이동
          if (!data.accessToken) throw new Error("accessToken missing");
          setAccessToken(data.accessToken);
          await saveRefreshTokenSecurely(data.refreshToken);
          if (!mounted.current) return;
          navigation.replace("FeedStack");
          return;
        }

        // 2-B) 회원가입 필요: 웹뷰용 세션 쿠키 심기
        if (!data.authId) throw new Error("authId missing for signup");

        const s = await api.post(`/auth/mobile/session`, { authId: data.authId });
        const webUrl: string = s.data?.data?.webUrl ?? "https://app.yourdomain.com/mobile/additional-info";

        if (!mounted.current) return;
        navigation.replace("SignupWebView", { webUrl });
      } catch (e: any) {
        if (!mounted.current) return;
        setErr(e?.message ?? "로그인 처리 중 오류가 발생했습니다.");
      }
    })();

    return () => {
      mounted.current = false;
    };
  }, [code, navigation]);

  return (
    <View style={S.root}>
      <ActivityIndicator size="large" />
      <Text style={S.msg}>{err ?? "로그인 중입니다..."}</Text>
      {err ? (
        <Button title="다시 시도" onPress={() => navigation.replace("LoginBridge", { code })} />
      ) : null}
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FAFAFA", gap: 12 },
  msg: { color: "#374151", fontSize: 14 },
});
