// src/layouts/AuthorizedWebView.tsx
import React, { useEffect, useMemo, useState } from 'react';
import WebView, { WebViewProps, WebViewMessageEvent } from 'react-native-webview';
import { getAccessToken } from '../lib/tokenStorage';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = WebViewProps & {
  uri: string;
};

type RootNav = NativeStackNavigationProp<RootStackParamList>;

export default function AuthorizedWebView({ uri, ...rest }: Props) {
  const [token, setToken] = useState<string | null>(null);
  const navigation = useNavigation<RootNav>();

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
          console.log('[AuthorizedWebView] injected token len=', token ? token.length : 0);
        } catch (e) {
          console.log('[AuthorizedWebView] inject error', e);
        }
      })();
      true;
    `,
    [token],
  );

  const handleMessage = (event: WebViewMessageEvent) => {
    const raw = event.nativeEvent.data;

    try {
      const msg = JSON.parse(raw);

      if (msg.type === 'DEBUG') {
        console.log('[WEB DEBUG]', msg.tag, msg.payload);
        return;
      }

      if (msg.type === 'OPEN_FEED_EDIT') {
        console.log('[WEB MSG] OPEN_FEED_EDIT 수신');

        // FeedWrite는 FeedWriteStack 안에 있으므로 이렇게 들어가야 함
        navigation.navigate('FeedWriteStack', {
          screen: 'FeedWrite',
          params: {
            mode: 'edit',
            // FeedWriteStackParamList 타입 만족용 (edit에선 안 써도 됨)
            categoryId: 0,
            categoryName: '',
            categoryValue: '',
          },
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
