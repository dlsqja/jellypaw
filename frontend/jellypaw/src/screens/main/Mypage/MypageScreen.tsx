import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import WebView from 'react-native-webview';
import { ACCESS_TOKEN } from '@env';

const os = Platform.OS;
os === 'android';

export default function MypageScreen() {
  const injectedJavaScript = useMemo(
    //  토큰 넣는 함수 -> 로그인 넣으면 삭제 해도 됨
    () => `
      (function() {
        try {
          localStorage.setItem('accessToken', ${JSON.stringify(ACCESS_TOKEN || '')});
        } catch (e) {
          console.log('[MypageScreen] Failed to inject accessToken', e);
        }
      })();
      true;
    `,
    [],
  );

  return (
    <WebView
      cacheEnabled={false}
      cacheMode="LOAD_NO_CACHE"
      source={{ uri: 'http://k13a201.p.ssafy.io:3000/mypage' }}
      sharedCookiesEnabled
      thirdPartyCookiesEnabled
      injectedJavaScript={injectedJavaScript}
    />
  );
}
