// src/screens/auth/KakaoWebViewScreen.tsx
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/auth/AuthStackNavigator';
import { KAKAO_REDIRECT_URI } from '@env';

type Props = NativeStackScreenProps<AuthStackParamList, 'KakaoWebView'>;

export default function KakaoWebViewScreen({ route, navigation }: Props) {
  const { authorizeUrl } = route.params; // incognito는 받아도 무시해도 됨

  const onShouldStart = (req: any) => {
    const url: string = req.url;
    if (url.startsWith(KAKAO_REDIRECT_URI)) {
      const codeMatch = url.match(/[?&]code=([^&]+)/);
      const code = codeMatch?.[1];
      if (code) navigation.replace('LoginBridge', { code });
      else navigation.goBack();
      return false;
    }
    return true;
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: authorizeUrl }}
        incognito={false}
        cacheEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        javaScriptEnabled
        onShouldStartLoadWithRequest={onShouldStart}
        startInLoadingState
        renderLoading={() => (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        )}
      />
    </View>
  );
}
