// src/layouts/AuthorizedWebView.tsx
import React, { useEffect, useMemo, useState } from 'react';
import WebView, { WebViewProps } from 'react-native-webview';
import { getAccessToken } from '../lib/tokenStorage';

type Props = WebViewProps & {
  uri: string;
};

export default function AuthorizedWebView({ uri, ...rest }: Props) {
  const [token, setToken] = useState<string | null>(null);

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

  return (
    <WebView
      source={{ uri }}
      sharedCookiesEnabled
      thirdPartyCookiesEnabled
      cacheEnabled={false}
      cacheMode="LOAD_NO_CACHE"
      injectedJavaScript={injectedJavaScript}
      {...rest}
    />
  );
}
