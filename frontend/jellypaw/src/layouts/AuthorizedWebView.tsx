// src/layouts/AuthorizedWebView.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import WebView, { WebViewProps, WebViewMessageEvent } from 'react-native-webview';
import { getAccessToken, clearTokens } from '../lib/tokenStorage';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DeviceEventEmitter } from 'react-native';
import { queryClient } from '../lib/queryClient';
import { resetToKakaoLogin } from '../navigation/navigationRef';
import { navigationRef, getActiveRoutePath } from '../navigation/navigationRef';

type Props = WebViewProps & { uri: string };
type RootNav = NativeStackNavigationProp<RootStackParamList>;

export default function AuthorizedWebView({ uri, ...rest }: Props) {
  const [token, setToken] = useState<string | null>(null);
  const navigation = useNavigation<RootNav>();
  const webRef = useRef<WebView>(null);
  const loggingOutRef = useRef(false);
  useEffect(() => {
    (async () => {
      try {
        const stored = await getAccessToken();
        setToken(stored);
      } catch (e) {
        setToken(null);
      }
    })();
  }, []);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('FEED_UPDATED', (payload) => {

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
        return;
      }

      if (msg.type === 'OPEN_FEED_EDIT') {
        navigation.navigate('FeedWriteStack', {
          screen: 'FeedWrite',
          params: { mode: 'edit', categoryId: 0, categoryName: '', categoryValue: '' },
        });
        return;
      }

      if (msg.type === 'LOGOUT_REQUEST') {
          if (loggingOutRef.current) return; // 중복 방지
       loggingOutRef.current = true;
        // 1) 네이티브 토큰 제거
        await clearTokens();
          setToken(null);

          queryClient.clear();

       // 1) 네이티브 네비게이션을 가장 먼저 확실히 리셋
        resetToKakaoLogin();
               // 2) 웹뷰 쪽은 페이지 전환만 막고 스토리지만 정리 (리다이렉트는 굳이 안 해도 됨)
       webRef.current?.injectJavaScript(`
         try {
           localStorage.removeItem('accessToken');
           localStorage.removeItem('refreshToken');
         } catch(e) {}
         true;
       `);
       // 3) 혹시라도 ref 준비 전이라 reset 못 탔을 상황을 대비한 폴백 (현재 네비 인스턴스로)
       try {
         setTimeout(() => {
            
           // 중첩 상태까지 정확히 지정
           (navigation as any).reset?.({
             index: 0,
             routes: [
               {
                 name: 'AuthStack',
                 params: { screen: 'KakaoLogin' },
               },
             ],
           });

         }, 0);
       } catch (e) {

       }

        return;
      }

    } catch (e) {
    }

    rest.onMessage?.(event);
  };

  return (
    <WebView
      ref={webRef}
      source={{ uri }}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      sharedCookiesEnabled
      thirdPartyCookiesEnabled
      cacheEnabled={false}
      cacheMode="LOAD_NO_CACHE"
      injectedJavaScript={injectedJavaScript}
      onMessage={handleMessage}
      allowsInlineMediaPlayback={true}
      mediaPlaybackRequiresUserAction={false}
      onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.error('[AuthorizedWebView] WebView error:', nativeEvent);
      }}
      onHttpError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.error('[AuthorizedWebView] HTTP error:', nativeEvent.statusCode, nativeEvent.url);
      }}
      {...rest}
    />
  );
}
