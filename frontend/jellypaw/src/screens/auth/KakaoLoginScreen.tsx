// src/screens/auth/KakaoLoginScreen.tsx
import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../ui/components/Text';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthStackNavigator';
import { Button } from '../../ui/components/Button';

export default function KakaoLoginScreen({
  navigation,
}: NativeStackScreenProps<AuthStackParamList, 'KakaoLogin'>) {
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
      <View style={S.content}>
        {/* 로고 */}
        <Image
          source={{ uri: 'https://placehold.co/95x95' }}
          style={S.logo}
          resizeMode="contain"
        />

        {/* 서브 카피 */}
        <Text style={S.subtitle}>반려동물과 함께하는 일상을 공유해보세요</Text>

        {/* 버튼 */}
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
            style={{ width: '100%', height: 64, paddingHorizontal: 16 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 24, // 좌우 여백 → 버튼 w:327
  },
  // 시안처럼 전체 블록을 아래로 내리기
  content: {
    marginTop: 175,
    alignItems: 'center',
    width: '100%',
  },
  // 로고 95px + 다음 요소와 51px 간격
  logo: {
    width: 95,
    height: 95,
    marginBottom: 51,
  },
  // 텍스트는 기존 타이포 유지, 아래와 51px 간격
  subtitle: {
    textAlign: 'center',
    fontSize: 22,
    fontFamily: 'Pretendard-Bold',
    color: '#284542',
    lineHeight: 32,
    marginBottom: 51,
    maxWidth: 293, // 시안 느낌의 가로 폭 제한
  },
  ctaWrap: {
    width: '100%',
  },
});
