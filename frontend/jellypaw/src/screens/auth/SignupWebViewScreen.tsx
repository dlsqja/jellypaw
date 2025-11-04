// src/screens/auth/SignupWebViewScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SafeAreaLayout from '../../components/MobilelLayout';
import { Text } from '../../ui/components/Text';
import Input from '../../ui/components/Input';
import { Button } from '../../ui/components/Button';

type Props = NativeStackScreenProps<any>;

export default function SignupWebViewScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();

  const kakaoEmail = route?.params?.email ?? '카카오톡 이메일 기본값';

  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | undefined>();

  const onSubmit = () => {
    if (!nickname.trim()) {
      setError('닉네임을 입력하세요');
      return;
    }
    setError(undefined);
    navigation.replace('SelectCategory');
  };

  return (
    <SafeAreaLayout backgroundColor="#FAFAFA" style={S.root}>
      {/* 상단 타이틀 바 */}
      <View style={S.header}>
        <Text style={S.headerTitle}>추가 정보 입력</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              S.content,
              // 제스처 홈 인디케이터에 버튼이 가려지지 않도록
              { paddingBottom: insets.bottom + 24 },
            ]}
          >
            {/* 상단 로고 */}
            <View style={S.logoWrap}>
              <Image
                source={{ uri: 'https://placehold.co/95x95' }}
                style={{ width: 95, height: 95 }}
                resizeMode="contain"
              />
            </View>

            {/* 폼 */}
            <View style={{ width: '100%' }}>
              <Input label="이메일" value={kakaoEmail} editable={false} />
              <Text style={S.meta}>
                카카오에서 제공된 이메일이에요. 수정은 카카오에서 가능
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

            {/* CTA */}
            <View style={S.cta}>
              <Button
                title="회원 가입"
                tone="aqua"
                shape="pillSolid"
                size="lg"
                style={{ width: '100%', height: 60, paddingHorizontal: 32 }}
                titleStyle={{ fontFamily: 'Pretendard-SemiBold', fontSize: 16 }}
                onPress={onSubmit}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaLayout>
  );
}

const S = StyleSheet.create({
  root: { flex: 1 }, // 배경색은 SafeAreaLayout의 backgroundColor로 제어
  header: {
    height: 60,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  headerTitle: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 20,
    lineHeight: 28,
    color: '#284542',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    alignItems: 'center',
  },
  logoWrap: {
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  meta: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontFamily: 'Pretendard-Regular',
  },
  nickLabel: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    fontFamily: 'Pretendard-SemiBold',
  },
  cta: {
    width: '100%',
    paddingTop: 24,
  },
});
