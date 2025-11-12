// src/layouts/AuthorizedWebView.tsx
import React, { useEffect, useMemo, useState } from 'react';
import WebView, { WebViewProps } from 'react-native-webview';
import { getAccessToken } from '../lib/tokenStorage';
import { useNavigation } from '@react-navigation/native';

type Props = WebViewProps & {
  uri: string;
};

export default function AuthorizedWebView({ uri, ...rest }: Props) {
  const [token, setToken] = useState<string | null>(null);
  const navigation = useNavigation<any>();
  useEffect(() => {
    (async () => {
      try {
        const stored = await getAccessToken();
        setToken(stored);
      } catch (e) {
        console.log('[AuthorizedWebView] getAccessToken error', e);
        setToken(null);
      }
    })();
  }, []);

  const injectedJavaScript = useMemo(
    () => `
      (function() {
        try {
          const token = ${JSON.stringify(token || '')};

          if (token) {
            window.localStorage.setItem('accessToken', token);
          } else {
            window.localStorage.removeItem('accessToken');
          }

          console.log(
            '[AuthorizedWebView] injected token len=',
            token ? token.length : 0
          );
        } catch (e) {
          console.log('[AuthorizedWebView] inject error', e);
        }
      })();
      true;
    `,
    [token],
  );

  // 🔹 여기: Web → RN 메시지 처리 (DEBUG / OPEN_FEED_EDIT)
  const handleMessage: WebViewProps['onMessage'] = (event) => {
    const raw = event.nativeEvent.data;
    try {
      const msg = JSON.parse(raw);

      // 웹에서 보낸 디버그 로그
      if (msg.type === 'DEBUG') {
        console.log('[WEB DEBUG]', msg.tag, msg.payload);
        return;
      }

      // 수정 진입 트리거
      if (msg.type === 'OPEN_FEED_EDIT') {
        console.log('[WEB MSG] OPEN_FEED_EDIT 수신');

        //  여기 네비게이션 구조에 맞게 이동
        // 예시1) FeedWrite가 바로 stack에 있을 때
        // navigation.navigate('FeedWrite', { mode: 'edit' });

        // 예시2) FeedWriteNavigator 안에 있을 때
        // navigation.navigate('FeedWriteNavigator', {
        //   screen: 'FeedWrite',
        //   params: { mode: 'edit' },
        // });

        navigation.navigate('FeedWrite', { mode: 'edit' });

        return;
      }

      console.log('[WEB MSG] 기타', msg);
    } catch (e) {
      // JSON 아니면 그냥 찍기
      console.log('[WEB MSG RAW]', raw);
    }
  };

  return (
    <WebView
      source={{ uri }}
      sharedCookiesEnabled
      thirdPartyCookiesEnabled
      cacheEnabled={false}
      cacheMode="LOAD_NO_CACHE"
      injectedJavaScript={injectedJavaScript}
      onMessage={handleMessage} 
      {...rest}
    />
  );
}
