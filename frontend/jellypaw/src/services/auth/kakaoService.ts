// // src/features/auth/kakaoService.ts
// import { Linking } from 'react-native';
// import { API_BASE_URL } from '../../env';
// import api from '../http/apiClient';
// import { setTokens } from './tokenStore';

// const APP_SCHEME = 'jellypaw';
// const CALLBACK = `${APP_SCHEME}://oauth/kakao`;

// // 슬래시 정리 + 빈값 방지
// const BASE = (API_BASE_URL || '').replace(/\/+$/, '');
// if (!BASE) {
//   console.warn('[kakaoService] API_BASE_URL is empty');
// }

// // 백엔드 로그인 시작 URL (백엔드 사양에 맞게 경로/쿼리만 바꿔도 됨)
// const LOGIN_URL = `${API_BASE_URL}/auth/kakao/start?client=app&redirect_uri=${encodeURIComponent(CALLBACK)}`;
// // 1회용 code → 앱 토큰 교환 엔드포인트
// const EXCHANGE_PATH = '/auth/exchange';

// function extractCode(url: string | null): string | null {
//   if (!url) return null;
//   try {
//     const u = new URL(url);
//     if (u.protocol !== `${APP_SCHEME}:`) return null;
//     if (u.host !== 'oauth' || u.pathname !== '/kakao') return null;
//     return u.searchParams.get('code');
//   } catch {
//     return null;
//   }
// }

// export async function signInWithKakao() {
//   // 1) 콜백 리스너(1회성)
//   let settled = false;
//   const waitForCallback = new Promise<string>((resolve) => {
//     const handler = ({ url }: { url: string }) => {
//       if (settled) return;
//       const code = extractCode(url);
//       if (code) {
//         settled = true;
//         sub.remove();
//         resolve(code);
//       }
//     };
//     const sub = Linking.addEventListener('url', handler);

//     // 콜드스타트 케이스도 처리
//     Linking.getInitialURL().then((u) => {
//       if (settled) return;
//       const code = extractCode(u ?? null);
//       if (code) {
//         settled = true;
//         sub.remove();
//         resolve(code);
//       }
//     }).catch(() => {});
//   });

//   // 2) 외부 브라우저로 백엔드 로그인 시작
//   await Linking.openURL(LOGIN_URL);

//   // 3) 딥링크로 받은 code로 토큰 교환
//   const code = await waitForCallback;
//   const { data } = await api.post(EXCHANGE_PATH, { code });
//   await setTokens(data.accessToken, data.refreshToken);
// }
