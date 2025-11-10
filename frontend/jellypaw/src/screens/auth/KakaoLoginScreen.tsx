// src/screens/auth/KakaoLoginScreen.tsx
import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Button } from '../../ui/components/Button';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/auth/AuthStackNavigator';
import { KAKAO_REST_API_KEY, KAKAO_REDIRECT_URI } from '@env';

type Props = NativeStackScreenProps<AuthStackParamList, 'KakaoLogin'>;

export default function KakaoLoginScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);

  const onPress = () => {
    // 카카오 authorize URL 구성
    const authorizeUrl =
      `https://kauth.kakao.com/oauth/authorize` +
      `?client_id=${KAKAO_REST_API_KEY}` +
      `&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}` +
      `&response_type=code`;

      console.log('[KAKAO AUTH URL]', authorizeUrl);

    // WebView 화면으로 이동 (여기서 로그인 + code 추출)
    navigation.navigate('KakaoWebView', { authorizeUrl });
  };

  return (
    <View style={S.root}>
      <View style={S.content}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={{ width: 300, height: 300 }}
          resizeMode="contain"
        />
        <View style={S.ctaWrap}>
          <Button
            title="카카오로 시작하기"
            tone="kakao"
            shape="pillSolid"
            size="lg"
            loading={loading}
            disabled={loading}
            onPress={onPress}
            style={{ width: '100%', height: 64, paddingHorizontal: 16 }}
          />
        </View>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { marginTop: 175, alignItems: 'center', width: '100%' },
  ctaWrap: { width: '100%' },
});
