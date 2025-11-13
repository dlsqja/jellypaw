// src/screens/auth/KakaoLoginScreen.tsx
import React, { useState } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Button } from '../../ui/components/Button';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/auth/AuthStackNavigator';
import { KAKAO_REST_API_KEY, KAKAO_REDIRECT_URI } from '@env';

type Props = NativeStackScreenProps<AuthStackParamList, 'KakaoLogin'>;

export default function KakaoLoginScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);

  const buildAuthorizeUrl = (opts?: { prompt?: 'select_account' | 'login' }) =>
    `https://kauth.kakao.com/oauth/authorize` +
    `?client_id=${KAKAO_REST_API_KEY}` +
    `&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}` +
    `&response_type=code` +
    (opts?.prompt ? `&prompt=${opts.prompt}` : '');

  // 기본: 원탭 자동 로그인
  const onPressDefault = () => {
    const authorizeUrl = buildAuthorizeUrl();
    navigation.navigate('KakaoWebView', { authorizeUrl, incognito: false });
  };

  // 계정 전환: 선택 강제 + incognito
  const onPressOtherAccount = async () => {
    try {
      setLoading(true);
    } catch {}
    const authorizeUrl = buildAuthorizeUrl({ prompt: 'select_account' });
    navigation.navigate('KakaoWebView', { authorizeUrl, incognito: true });
    setLoading(false);
  };

  return (
    <View style={S.root}>
      <View style={S.content}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={{ width: 300, height: 300 }}
          resizeMode="contain"
        />

        {/* 기본 로그인 버튼 */}
        <View style={S.ctaWrap}>
          <Button
            title="카카오로 시작하기"
            tone="kakao"
            shape="pillSolid"
            size="lg"
            loading={loading}
            disabled={loading}
            onPress={onPressDefault}
            style={{ width: '100%', height: 64, paddingHorizontal: 16 }}
          />
        </View>

        {/* 회색 작은 텍스트를 클릭해서 다른 계정 로그인 */}
        <View style={S.altWrap}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPressOtherAccount}
            disabled={loading}
          >
            <Text style={S.helpText}>
              다른 카카오 계정으로 로그인
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' , paddingHorizontal: 16,},
  content: { marginTop: 175, alignItems: 'center', width: '100%' },
  ctaWrap: { width: '100%' },
  altWrap: { width: '100%', marginTop: 16, alignItems: 'center' },
  helpText: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
