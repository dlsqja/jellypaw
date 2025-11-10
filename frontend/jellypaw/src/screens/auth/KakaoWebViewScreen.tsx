// src/screens/auth/KakaoWebViewScreen.tsx
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/auth/AuthStackNavigator';
import { KAKAO_REDIRECT_URI } from '@env';

type Props = NativeStackScreenProps<AuthStackParamList, 'KakaoWebView'>;

export default function KakaoWebViewScreen({ route, navigation }: Props) {
  const { authorizeUrl } = route.params;

  const onShouldStart = (req: any) => {
    const url: string = req.url;

    // Kakao가 redirect_uri로 보내려는 시점
    if (url.startsWith(KAKAO_REDIRECT_URI)) {
      const codeMatch = url.match(/[?&]code=([^&]+)/);
      const code = codeMatch?.[1];

      if (code) {
        // WebView 닫고 LoginBridge로 이동 → 여기서 /auth/kakao 호출
        navigation.replace('LoginBridge', { code });
      } else {
        navigation.goBack();
      }
      return false; // 이 URL 로드는 막음 (백엔드 페이지 열리지 않게)
    }

    return true; // 나머지는 그대로 진행
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: authorizeUrl }}
        onShouldStartLoadWithRequest={onShouldStart}
        startInLoadingState
        renderLoading={() => (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator size="large" />
          </View>
        )}
      />
    </View>
  );
}
