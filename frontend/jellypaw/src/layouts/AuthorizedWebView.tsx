// src/layouts/AuthorizedWebView.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import WebView, { WebViewProps, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { getAccessToken, clearTokens } from '../lib/tokenStorage';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DeviceEventEmitter, BackHandler, Platform } from 'react-native';
import { queryClient } from '../lib/queryClient';
import { resetToKakaoLogin } from '../navigation/navigationRef';
import { navigationRef, getActiveRoutePath } from '../navigation/navigationRef';

type RootNav = NativeStackNavigationProp<RootStackParamList>;
type Props = WebViewProps & {
  uri: string;
  /** 안드로이드 하드웨어 뒤로가기를 WebView history에 먼저 위임할지 여부 */
  enableWebBack?: boolean;
};

export default function AuthorizedWebView({
  uri,
  enableWebBack = true,
  onMessage,                 // 외부에서 넘어올 수 있는 이벤트 핸들러들 분리
  onNavigationStateChange,
  ...rest
}: Props) {
  const [token, setToken] = useState<string | null>(null);
  const navigation = useNavigation<RootNav>();
  const webRef = useRef<WebView>(null);
  const loggingOutRef = useRef(false);

  // 🔹 WebView 뒤로가기 가능 여부
  const [canGoBack, setCanGoBack] = useState(false);
  
  // 🔹 canGoBack을 ref로도 추적 (closure 문제 방지)
  const canGoBackRef = useRef(false);
  useEffect(() => {
    canGoBackRef.current = canGoBack;
  }, [canGoBack]);
  
  // 🔹 fromWrite 플래그 (게시글 작성 완료 후 이동한 경우)
  const [shouldAddFeedHistory, setShouldAddFeedHistory] = useState(false);
  
  // 🔹 fromWrite일 때 기기 뒤로가기로 /feed로 이동해야 하는지 추적
  const shouldNavigateToFeedRef = useRef(false);
  
  // 🔹 히스토리 조작 중인지 추적 (히스토리 조작으로 인한 네비게이션 상태 변경 무시)
  const isManipulatingHistoryRef = useRef(false);

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

  // 🔹 안드로이드 하드웨어 뒤로가기 → WebView history 우선 소비
  useEffect(() => {
    if (!enableWebBack || Platform.OS !== 'android') return;

    const onBackPress = () => {
      console.log('[AuthorizedWebView] Hardware back pressed - canGoBack:', canGoBackRef.current, 'shouldNavigateToFeed:', shouldNavigateToFeedRef.current, 'webRef exists:', !!webRef.current);
      
      // fromWrite일 때는 직접 /feed로 네비게이션
      if (shouldNavigateToFeedRef.current && webRef.current) {
        console.log('[AuthorizedWebView] Navigating to /feed (fromWrite)');
        webRef.current.injectJavaScript(`
          (function() {
            try {
              if (window.__REACT_ROUTER_NAVIGATE) {
                window.__REACT_ROUTER_NAVIGATE('/feed');
              } else {
                window.location.href = '/feed';
              }
            } catch(e) {
              console.error('[WEB] Failed to navigate to /feed:', e);
            }
          })();
          true;
        `);
        return true; // RN 쪽으로 이벤트 안 넘김 (앱 종료 방지)
      }
      
      // ref를 사용하여 항상 최신 값을 참조
      if (canGoBackRef.current && webRef.current) {
        console.log('[AuthorizedWebView] Executing webRef.current.goBack()');
        webRef.current.goBack();
        return true; // RN 쪽으로 이벤트 안 넘김 (앱 종료 방지)
      }
      
      // WebView 히스토리가 없으면 RN 네비게이션이 처리하도록 false
      console.log('[AuthorizedWebView] No WebView history, returning false');
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [enableWebBack]); // canGoBack 제거 - ref 사용하므로 dependency 불필요

  useEffect(() => {
  const feedUpdatedSub = DeviceEventEmitter.addListener('FEED_UPDATED', (payload) => {
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

  const clearFeedScrollSub = DeviceEventEmitter.addListener('CLEAR_FEED_SCROLL', () => {
    webRef.current?.injectJavaScript(`
      (function() {
        try {
          sessionStorage.removeItem('feed-scroll-top');
          console.log('[WEB] CLEAR_FEED_SCROLL: feed scroll memory cleared');
        } catch (e) {
          console.log('[WEB] CLEAR_FEED_SCROLL error', e);
        }
      })();
      true;
    `);
  });

  const feedScrollToTopSub = DeviceEventEmitter.addListener('FEED_SCROLL_TO_TOP', () => {
    if (!canGoBack) {
        webRef.current?.injectJavaScript(`
          (function() {
            try {
                const event = new CustomEvent('FEED_SCROLL_TO_TOP');
                window.dispatchEvent(event);
                console.log('[WEB] FEED_SCROLL_TO_TOP event dispatched because canGoBack is false.');
            } catch (e) {
                console.log('[WEB] FEED_SCROLL_TO_TOP dispatch error', e);
            }
          })();
          true;
        `);
    } else {
        console.log('[AuthorizedWebView] FEED_SCROLL_TO_TOP ignored because canGoBack is true (likely in detail page).');
    }
  });

  const webviewGoBackSub = DeviceEventEmitter.addListener('WEBVIEW_GO_BACK', () => {
        if (canGoBack && webRef.current) {
            console.log('[AuthorizedWebView] WEBVIEW_GO_BACK received, executing webRef.current.goBack()');
            webRef.current.goBack();
        } else {
            console.log('[AuthorizedWebView] WEBVIEW_GO_BACK received, but canGoBack is false or webRef is null.');
        }
    });

  // 🔹 피드 탭 클릭 시 WebView 경로 확인
  const checkFeedWebViewPathSub = DeviceEventEmitter.addListener('CHECK_FEED_WEBVIEW_PATH', () => {
    webRef.current?.injectJavaScript(`
      (function() {
        try {
          const path = window.location.pathname;
          const isFeedList = path === '/feed' || path === '/feed/';
          
          console.log('[WEB] CHECK_FEED_WEBVIEW_PATH: current path =', path, 'isFeedList =', isFeedList);
          
          if (isFeedList) {
            // 이미 피드 목록이면 → 스크롤 초기화
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
              type: 'FEED_TAB_CLICKED', 
              shouldRestoreScroll: false 
            }));
          } else {
            // 피드 상세나 다른 페이지면 → 스크롤 복원하며 /feed로 이동
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
              type: 'FEED_TAB_CLICKED', 
              shouldRestoreScroll: true 
            }));
          }
        } catch(e) {
          console.error('[WEB] CHECK_FEED_WEBVIEW_PATH error', e);
          window.ReactNativeWebView.postMessage(JSON.stringify({ 
            type: 'FEED_TAB_CLICKED', 
            shouldRestoreScroll: false 
          }));
        }
      })();
      true;
    `);
  });

  return () => {
    feedUpdatedSub.remove();
    clearFeedScrollSub.remove();
    feedScrollToTopSub.remove();
    webviewGoBackSub.remove();
    checkFeedWebViewPathSub.remove();
  };
}, [canGoBack]);


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
        // WebView에서 보낸 디버그 메시지 출력
        console.log('[WEB DEBUG]', msg.message || msg);
        return;
      }

      if (msg.type === 'OPEN_FEED_EDIT') {
        navigation.navigate('FeedWriteStack', {
          screen: 'FeedWrite',
          params: { mode: 'edit', categoryId: 0, categoryName: '', categoryValue: '' },
        });
        return;
      }

      if (msg.type === 'FEED_TAB_CLICKED') {
        const shouldRestoreScroll = msg.shouldRestoreScroll === true;
        console.log('[AuthorizedWebView] FEED_TAB_CLICKED received, shouldRestoreScroll =', shouldRestoreScroll);
        
        if (shouldRestoreScroll) {
          // 스크롤 복원하며 /feed로 이동 (WebView 내부 라우팅)
          // 즉시 실행되도록 최적화
          const navigationScript = `
            (function() {
              try {
                const currentPath = window.location.pathname;
                if (currentPath === '/feed' || currentPath === '/feed/') {
                  return;
                }
                
                // 방법 1: 전역 함수 직접 호출 (가장 빠름)
                if (typeof window.__REACT_ROUTER_NAVIGATE === 'function') {
                  window.__REACT_ROUTER_NAVIGATE('/feed');
                  return;
                }
                
                // 방법 2: CustomEvent 발생 (동기적으로 처리)
                const event = new CustomEvent('NAVIGATE_TO_FEED', { 
                  detail: { restoreScroll: true },
                  bubbles: true,
                  cancelable: true
                });
                const dispatched = window.dispatchEvent(event);
                
                // 방법 3: 즉시 window.history.pushState + popstate 이벤트 (React Router가 감지)
                // 이 방법이 가장 빠르고 React Router와 호환됨
                if (window.history && window.history.pushState) {
                  window.history.pushState(null, '', '/feed');
                  window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
                  return;
                }
                
                // 최종 폴백: window.location (페이지 리로드 발생하지만 확실함)
                window.location.href = '/feed';
              } catch(e) {
                // 에러 발생 시 최종 폴백
                try {
                  window.location.href = '/feed';
                } catch(e2) {
                  console.error('[WEB] Navigation failed:', e2);
                }
              }
            })();
            true;
          `;
          
          console.log('[AuthorizedWebView] Injecting navigation script...');
          webRef.current?.injectJavaScript(navigationScript);
          
          // FEED_SCROLL_TO_TOP은 emit하지 않음 (스크롤 복원해야 하므로)
        } else {
          // 이미 피드 목록이면 → 스크롤 초기화
          // canGoBack 체크 없이 무조건 스크롤 맨 위로 (피드 목록에 있을 때는 항상 작동해야 함)
          webRef.current?.injectJavaScript(`
            (function() {
              try {
                const event = new CustomEvent('FEED_SCROLL_TO_TOP');
                window.dispatchEvent(event);
              } catch(e) {
                console.error('[WEB] FEED_SCROLL_TO_TOP dispatch error', e);
              }
            })();
            true;
          `);
          // 기존 이벤트도 emit (다른 리스너가 있을 수 있음)
          DeviceEventEmitter.emit('FEED_SCROLL_TO_TOP');
        }
        return;
      }

      if (msg.type === 'ADD_FEED_TO_HISTORY') {
        // 게시글 작성 완료 후 상세 페이지에서 히스토리에 /feed를 추가
        // 이렇게 하면 뒤로가기 시 /feed로 이동할 수 있음
        const addFeedToHistoryScript = `
          (function() {
            try {
              const currentUrl = window.location.pathname;
              
              // /feed를 히스토리에 추가 (현재 페이지는 그대로 유지)
              // pushState는 popstate 이벤트를 발생시키지 않으므로 React Router가 자동으로 이동하지 않음
              window.history.pushState(null, '', '/feed');
              
              // 현재 URL로 다시 이동하여 React Router가 현재 페이지를 계속 렌더링하도록 함
              // 이렇게 하면 히스토리 스택이 [..., /feed, /feed/123]이 됨
              window.history.pushState(null, '', currentUrl);
              
              console.log('[WEB] Added /feed to history, currentUrl:', currentUrl);
              
              // WebView에 히스토리 추가 완료 메시지 전송
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'FEED_HISTORY_ADDED'
                }));
              }
            } catch(e) {
              console.error('[WEB] Failed to add /feed to history:', e);
            }
          })();
          true;
        `;
        webRef.current?.injectJavaScript(addFeedToHistoryScript);
        return;
      }

      if (msg.type === 'FEED_HISTORY_ADDED') {
        // 히스토리 추가 완료 - 이제 히스토리 조작 플래그 리셋
        isManipulatingHistoryRef.current = false;
        console.log('[AuthorizedWebView] FEED_HISTORY_ADDED received, isManipulatingHistoryRef reset to false');
        
        // 히스토리 추가 완료 후 WebView의 canGoBack 상태 확인
        // pushState를 사용하면 onNavigationStateChange가 자동으로 호출되지 않을 수 있으므로
        // 약간의 지연 후 WebView의 네비게이션 상태를 확인
        setTimeout(() => {
          if (webRef.current) {
            // WebView의 네비게이션 상태를 확인하기 위해 JavaScript 주입
            webRef.current.injectJavaScript(`
              (function() {
                // 히스토리 길이 확인 (보안상 정확하지 않을 수 있지만, 히스토리가 있는지 확인하는 용도)
                // 실제로는 WebView의 네비게이션 상태가 업데이트되어야 함
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'CHECK_NAVIGATION_STATE'
                  }));
                }
              })();
              true;
            `);
          }
        }, 200);
        return;
      }

      if (msg.type === 'CHECK_NAVIGATION_STATE') {
        // 네비게이션 상태 확인 후 canGoBack 업데이트
        // 히스토리를 추가했으므로 canGoBack을 true로 설정
        setCanGoBack(true);
        console.log('[AuthorizedWebView] canGoBack set to true after history manipulation');
        return;
      }

      if (msg.type === 'LOGOUT_REQUEST') {
        if (loggingOutRef.current) return; // 중복 방지
        loggingOutRef.current = true;

        // 1) 네이티브 토큰 제거
        await clearTokens();
        setToken(null);
        queryClient.clear();

        // 2) 네이티브 네비 리셋
        resetToKakaoLogin();

        // 3) WebView 쪽 로컬스토리지 토큰 제거
        webRef.current?.injectJavaScript(`
          try {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          } catch(e) {}
          true;
        `);

        // 4) 폴백 네비게이션 리셋
        try {
          setTimeout(() => {
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
        } catch (e) {}

        return;
      }
    } catch (e) {
      // JSON 파싱 실패한 경우 그냥 외부 onMessage로 넘겨줌
    }

    // 🔹 외부에서 넘어온 onMessage도 호출
    onMessage?.(event);
  };

  // 🔹 WebView navigation 상태 변경 핸들러
  const handleNavStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    
    // fromWrite 쿼리 파라미터가 있는 경우 히스토리 추가 필요 여부 확인
    if (navState.url && navState.url.includes('fromWrite=true') && !shouldAddFeedHistory) {
      setShouldAddFeedHistory(true);
      shouldNavigateToFeedRef.current = true; // fromWrite일 때 기기 뒤로가기로 /feed로 이동
      console.log('[AuthorizedWebView] fromWrite detected, shouldNavigateToFeedRef set to true');
    }
    
    // 히스토리 조작 중이 아닐 때만 /feed로 이동한 경우 shouldNavigateToFeedRef 리셋
    // 히스토리 조작으로 인한 네비게이션 상태 변경은 무시
    // isManipulatingHistoryRef는 FEED_HISTORY_ADDED 메시지를 받았을 때만 리셋
    if (!isManipulatingHistoryRef.current) {
      const urlPath = navState.url?.split('?')[0] || '';
      if ((urlPath === '/feed' || urlPath.endsWith('/feed')) && !navState.url.includes('fromWrite=true')) {
        if (shouldNavigateToFeedRef.current) {
          console.log('[AuthorizedWebView] Reset shouldNavigateToFeedRef after navigating to /feed');
          shouldNavigateToFeedRef.current = false;
        }
      }
    }
    // 히스토리 조작 중이면 아무것도 하지 않음 (FEED_HISTORY_ADDED에서 리셋)
    
    // 바깥에서 onNavigationStateChange 넘겨준 경우도 함께 호출
    onNavigationStateChange?.(navState);
  };
  
  // 🔹 WebView 로드 완료 핸들러
  const handleLoadEnd = () => {
    // fromWrite가 true이고 히스토리가 아직 추가되지 않은 경우 히스토리 추가
    if (shouldAddFeedHistory && webRef.current) {
      console.log('[AuthorizedWebView] WebView loaded, adding /feed to history');
      isManipulatingHistoryRef.current = true; // 히스토리 조작 시작
      const addFeedToHistoryScript = `
        (function() {
          try {
            const currentUrl = window.location.pathname;
            
            // /feed를 히스토리에 추가 (현재 페이지는 그대로 유지)
            window.history.pushState(null, '', '/feed');
            
            // 현재 URL로 다시 이동하여 React Router가 현재 페이지를 계속 렌더링하도록 함
            window.history.pushState(null, '', currentUrl);
            
            console.log('[WEB] Added /feed to history, currentUrl:', currentUrl);
            
            // WebView에 히스토리 추가 완료 메시지 전송
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'FEED_HISTORY_ADDED'
              }));
            }
          } catch(e) {
            console.error('[WEB] Failed to add /feed to history:', e);
          }
        })();
        true;
      `;
      webRef.current.injectJavaScript(addFeedToHistoryScript);
      setShouldAddFeedHistory(false); // 한 번만 실행
    }
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
      onNavigationStateChange={handleNavStateChange}
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
      onLoadEnd={handleLoadEnd}
      {...rest}
    />
  );
}
