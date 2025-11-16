// src/navigation/navigationRef.ts
import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import type { RootStackParamList } from './RootNavigator';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// 현재 활성 라우트 경로 문자열로
export function getActiveRoutePath(): string {
  try {
    const state = navigationRef.getRootState();
    const segs: string[] = [];
    let cur: any = state;
    while (cur && cur.routes) {
      const r = cur.routes[cur.index ?? 0];
      segs.push(r.name);
      cur = r.state;
    }
    return segs.join(' > ');
  } catch {
    return 'UNKNOWN';
  }
}

export function resetToKakaoLogin() {
  const doReset = () => {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'AuthStack',
            state: {
              index: 0,
              routes: [{ name: 'KakaoLogin' }],
            },
          },
        ],
      }),
    );
    // reset 직후에도 한 프레임 뒤 경로 확인
    setTimeout(() => {
    }, 0);
  };

  if (navigationRef.isReady()) {
    doReset();
  } else {
    setTimeout(() => {
      if (navigationRef.isReady()) doReset();
      else console.log('[NAV] still not ready, reset skipped');
    }, 0);
  }
}
