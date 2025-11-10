// src/screens/auth/SignupWebViewScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { AuthStackParamList } from '../../navigation/auth/AuthStackNavigator';
import type { RootStackParamList } from '../../navigation/RootNavigator';

import BackHeader from '../../ui/components/BackHeader';
import { Text } from '../../ui/components/Text';
import Input from '../../ui/components/Input';
import { Button } from '../../ui/components/Button';
import {
  getEmailByAuthId,
  signupWithKakao,
} from '../../services/auth/userService';
import { setTokens } from '../../lib/tokenStorage';

type Props = CompositeScreenProps<
  NativeStackScreenProps<AuthStackParamList, 'SignupWebView'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function SignupWebViewScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { authId, email: initialEmail } = route.params || {};

  const [email, setEmail] = useState(initialEmail || '');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  // authId만 있고 email 없으면 서버에서 조회
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

  const onSubmit = async () => {
    if (!nickname.trim()) {
      setError('닉네임을 입력하세요');
      return;
    }
    setError(undefined);

    try {
      setLoading(true);
      const res = await signupWithKakao(email, nickname.trim());
      // 응답 래퍼 안에 accessToken 있음 (UserSignupResponse)
      const accessToken =
        res?.data?.accessToken || res?.data?.data?.accessToken;
      if (accessToken) {
        await setTokens(accessToken);
      }

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

  return (
    <View style={S.root}>
      <BackHeader title="추가 정보 입력" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              S.content,
              { paddingBottom: insets.bottom + 24 },
            ]}
          >
            <View style={{ width: '100%' }}>
              <Input label="이메일" value={email} editable={false} />
              <Text style={S.meta}>
                카카오에서 제공된 이메일이에요. 수정은 카카오에서 가능해요.
              </Text>

              <View style={{ height: 12 }} />

              <Text style={S.nickLabel}>닉네임</Text>
              <Input
                placeholder="닉네임을 입력하세요"
                value={nickname}
                onChangeText={setNickname}
                autoCapitalize="none"
                returnKeyType="done"
                errorText={error}
              />
            </View>

            <View style={S.cta}>
              <Button
                title="회원 가입"
                tone="aqua"
                shape="pillSolid"
                size="lg"
                loading={loading}
                disabled={loading}
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
  root: { flex: 1, backgroundColor: '#FAFAFA' },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    alignItems: 'center',
  },
  meta: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  nickLabel: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  cta: {
    width: '100%',
    paddingTop: 24,
  },
});
