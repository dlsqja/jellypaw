// src/screens/auth/KakaoLoginScreen.tsx
import React, { useState } from 'react';
import { View, Image, SafeAreaView, StyleSheet } from 'react-native';
import { AppText } from '../../ui/components/AppText';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../ui/components/Button';

export default function KakaoLoginScreen({
  navigation,
}: NativeStackScreenProps<any>) {
  const [loading, setLoading] = useState(false);
  const onPress = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.replace('SignupWebView');
    }, 400);
  };

  return (
    <SafeAreaView style={S.root}>
      {/* 상단 로고 (이미지 교체해서 쓰면 됨) */}
      <Image
        source={{ uri: 'https://placehold.co/160x160/png' }}
        style={S.logo}
        resizeMode="contain"
      />

      {/* 서브 카피 */}
      <AppText style={S.subtitle}>
        반려동물과 함께하는 일상을 공유해보세요
      </AppText>

      {/* 버튼: 가로 꽉, 높이 64, paddingHorizontal 16(px-4) */}
      <View style={S.ctaWrap}>
        <Button
          title="카카오로 시작하기"
          tone="kakao"
          shape="pillSolid"
          size="lg"
          titleStyle={{ fontFamily: 'Pretendard-Bold' }}
          loading={loading}
          disabled={loading}
          onPress={onPress}
          style={{ width: '100%', height: 64, paddingHorizontal: 16 }} // ✅ 가로 꽉 + px-4
        />
      </View>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 24, // 화면 좌우 여백
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 160,
    marginTop: 48,
    marginBottom: 24,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 22,
    fontFamily: 'Pretendard-Bold',
    color: '#284542',
    lineHeight: 32,
    marginBottom: 64,
  },
  ctaWrap: {
    width: '100%',
    marginTop: 8,
  },
});
