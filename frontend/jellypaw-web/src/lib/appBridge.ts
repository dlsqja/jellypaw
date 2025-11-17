// src/lib/appBridge.ts
export const inApp = () =>
  typeof (window as any).ReactNativeWebView !== 'undefined';

export const sendToApp = (msg: unknown) => {
  (window as any).ReactNativeWebView?.postMessage(JSON.stringify(msg));
};

export const webOnlyLogout = () => {
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } catch {}
  // 로그인(카카오) 진입 경로로 이동
  window.location.href = '/auth';
};
