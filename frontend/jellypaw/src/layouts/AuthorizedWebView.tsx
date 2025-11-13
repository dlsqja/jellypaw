// src/layouts/AuthorizedWebView.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import WebView, { WebViewProps, WebViewMessageEvent } from 'react-native-webview';
import { getAccessToken, clearTokens } from '../lib/tokenStorage';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DeviceEventEmitter } from 'react-native';

type Props = WebViewProps & { uri: string };
type RootNav = NativeStackNavigationProp<RootStackParamList>;

export default function AuthorizedWebView({ uri, ...rest }: Props) {
  const [token, setToken] = useState<string | null>(null);
  const navigation = useNavigation<RootNav>();
  const webRef = useRef<WebView>(null); // ← 추가

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

useEffect(() => {
  const sub = DeviceEventEmitter.addListener('FEED_UPDATED', (payload) => {
    console.log('[AuthorizedWebView] FEED_UPDATED', payload);

    const boardId = payload?.boardId;
    if (!boardId) return;

    webRef.current?.injectJavaScript(`
      (function() {
        try {
          const event = new CustomEvent('FEED_UPDATED', { detail: { boardId: ${boardId} } });
          window.dispatchEvent(event);
          console.log('[WEB] FEED_UPDATED event dispatched for boardId=${boardId}');
        } catch (e) {
          console.log('[WEB] FEED_UPDATED dispatch error', e);
        }
      })();
      true;
    `);
  });

  return () => {
    sub.remove();
  };
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
          console.log('[AuthorizedWebView] injected token len=', token ? token.length : 0);
        } catch (e) {
          console.log('[AuthorizedWebView] inject error', e);
        }
      })();
      true;
    `,
    [token],
  );

  const handleMessage = async (event: WebViewMessageEvent) => {
    const raw = event.nativeEvent.data;
    try {
      const msg = JSON.parse(raw);

      if (msg.type === 'DEBUG') {
        console.log('[WEB DEBUG]', msg.tag, msg.payload);
        return;
      }

      if (msg.type === 'OPEN_FEED_EDIT') {
        navigation.navigate('FeedWriteStack', {
          screen: 'FeedWrite',
          params: { mode: 'edit', categoryId: 0, categoryName: '', categoryValue: '' },
        });
        return;
      }

      // ✅ 로그아웃 처리
      if (msg.type === 'LOGOUT_REQUEST') {
        console.log('[WEB MSG] LOGOUT_REQUEST');

        // 1) 네이티브 토큰 제거
        await clearTokens();
        setToken(null);

        // 2) 웹뷰 스토리지 정리 + /auth로 이동
        webRef.current?.injectJavaScript(`
          try {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.replace('/auth');
          } catch(e) {}
          true;
        `);

        // 3) 네비게이션 초기화 → 카카오 로그인 화면
        navigation.reset({
          index: 0,
          routes: [{ name: 'AuthStack' }],
        });

        return;
      }

      console.log('[WEB MSG] 기타', msg);
    } catch (e) {
      console.log('[WEB MSG RAW]', raw);
    }

    rest.onMessage?.(event);
  };

  return (
    <WebView
      ref={webRef}                 // ← 추가
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
