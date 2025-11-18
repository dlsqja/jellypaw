// src/screens/auth/SignupWebViewScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { AuthStackParamList } from '../../navigation/auth/AuthStackNavigator';
import type { RootStackParamList } from '../../navigation/RootNavigator';

import BackHeader from '../../ui/components/BackHeader';
import { Text } from '../../ui/components/Text';
import Input from '../../ui/components/Input';
import { Button } from '../../ui/components/Button';
import { getEmailByAuthId, signupWithKakao, checkNicknameDuplicate } from '../../services/auth/userService';
import { setTokens } from '../../lib/tokenStorage';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import sendFcmToken, { ensureAndroidNotificationPermission } from '../../services/auth/fcm';

type Props = CompositeScreenProps<NativeStackScreenProps<AuthStackParamList, 'SignupWebView'>, NativeStackScreenProps<RootStackParamList>>;

type NicknameStatus = 'idle' | 'checking' | 'available' | 'duplicated' | 'error';

export default function SignupWebViewScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { authId, email: initialEmail } = route.params || {};

  const [email, setEmail] = useState(initialEmail || '');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | undefined>(); // 폼 전반 에러
  const [loading, setLoading] = useState(false);

  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>('idle');

  // 이메일 조회
  useEffect(() => {
    (async () => {
      try {
        if (authId && !initialEmail) {
          const serverEmail = await getEmailByAuthId(authId);
          if (serverEmail) setEmail(serverEmail);
        }
      } catch (e) {
        console.log('[Signup] getEmailByAuthId 실패', e);
      }
    })();
  }, [authId, initialEmail]);

  // 닉네임 디바운스 중복 체크
  useEffect(() => {
    const trimmed = nickname.trim();

    if (!trimmed) {
      setNicknameStatus('idle');
      return;
    }

    setNicknameStatus('checking');

    const timer = setTimeout(async () => {
      try {
        const duplicated = await checkNicknameDuplicate(trimmed);
        setNicknameStatus(duplicated ? 'duplicated' : 'available');
      } catch (e) {
        console.log('[Signup] checkNicknameDuplicate 실패', e);
        setNicknameStatus('error');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [nickname]);

  const onSubmit = async () => {
    const trimmed = nickname.trim();

    if (!trimmed) {
      setError('닉네임을 입력하세요');
      return;
    }

    if (nicknameStatus !== 'available') {
      if (nicknameStatus === 'checking') {
        setError(' ');
      } else if (nicknameStatus === 'duplicated') {
        setError('이미 사용 중인 닉네임이에요.');
      } else {
        setError('닉네임 중복을 다시 확인해 주세요.');
      }
      return;
    }

    setError(undefined);

    try {
      setLoading(true);
      const res = await signupWithKakao(email, trimmed);
      const accessToken = res?.data?.accessToken ?? res?.data?.data?.accessToken;
      const refreshToken = res?.data?.refreshToken ?? res?.data?.data?.refreshToken ?? null;
      if (accessToken) {
        await setTokens(accessToken, refreshToken); // ★ refresh 저장
      }

      // 회원가입 성공 시 FCM 토큰 발급 및 전송
      try {
        const messaging = getMessaging();
        // FCM 토큰 발급
        const fcmToken = await getToken(messaging);

        // FCM 토큰 서버 전송
        await sendFcmToken(fcmToken as string);
      } catch (error) {
        console.log('[FCM Token Error]', error);
      }

      // 피드화면 이동 전에 안드로이드 알림 권한 확인 + 요청
      await ensureAndroidNotificationPermission();

      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'FeedStack' as never }],
      });
    } catch (e: any) {
      console.log(e);
      setError(e?.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  let nicknameErrorText: string | undefined = error;
  let nicknameHelperText: string | undefined;
  let nicknameHelperStyle: any;

  if (!nicknameErrorText) {
    if (nicknameStatus === 'idle') {
      nicknameHelperText = ' ';
    } else if (nicknameStatus === 'checking') {
      // 회색 안내 문구
      nicknameHelperText = ' ';
    } else if (nicknameStatus === 'available') {
      // 사용 가능: aqua300
      nicknameHelperText = '사용 가능한 닉네임이에요.';
      nicknameHelperStyle = { color: '#6ABFB8' };
    } else if (nicknameStatus === 'duplicated') {
      // 빨간 에러
      nicknameErrorText = '이미 사용 중인 닉네임이에요.';
    } else if (nicknameStatus === 'error') {
      nicknameErrorText = '닉네임 중복 확인 중 오류가 발생했어요. 다시 시도해 주세요.';
    }
  }

  const canSubmit = !loading && nicknameStatus === 'available';

  return (
    <View style={S.root}>
      <BackHeader title="추가 정보 입력" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[S.content, { paddingBottom: insets.bottom + 24 }]}>
            <View style={{ width: '100%' }}>
              {/* 이메일 */}
              <Input label="이메일" value={email} editable={false} helperText="카카오에서 제공된 이메일이에요. 수정은 카카오에서 가능해요." />

              {/* 닉네임 */}
              <View style={{ height: 12 }} />
              <Text style={S.nickLabel}>닉네임</Text>
              <Input
                placeholder="닉네임을 입력하세요"
                value={nickname}
                onChangeText={setNickname}
                autoCapitalize="none"
                returnKeyType="done"
                errorText={nicknameErrorText}
                helperText={nicknameHelperText}
                helperTextStyle={nicknameHelperStyle}
              />
            </View>

            {/* CTA */}
            <View style={S.cta}>
              <Button
                title="회원 가입"
                tone="aqua"
                shape="pillSolid"
                size="lg"
                loading={loading}
                disabled={!canSubmit}
                style={{ width: '100%', height: 60, paddingHorizontal: 32 }}
                onPress={onSubmit}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const S = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
  },
  content: {
    paddingTop: 8,
    flexGrow: 1,
    justifyContent: 'center',
  },
  nickLabel: {
    marginTop: 0,
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  cta: {
    width: '100%',
    paddingTop: 24,
  },
});
