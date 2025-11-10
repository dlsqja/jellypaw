// src/screens/auth/KakaoLoginScreen.tsx
import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Button } from '../../ui/components/Button';
import { Text } from '../../ui/components/Text';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/auth/AuthStackNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'KakaoLogin'>;

export default function KakaoLoginScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);

  const onPress = async () => {
    try {
      setLoading(true);

      // 실제에선 Kakao SDK 사용해서 code 받아오기
      // const code = await getKakaoAuthCode();
      const code = 'KAKAO_AUTH_CODE_FROM_SDK';

      navigation.replace('LoginBridge', { code });
    } catch (e: any) {
      console.log(e);
      setLoading(false);
    }
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
