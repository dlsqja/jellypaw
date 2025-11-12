import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function debugToRN(tag: string, payload: any) {
  try {
    const w: any = window;
    const msg = { type: 'DEBUG', tag, payload };

    if (w.ReactNativeWebView && w.ReactNativeWebView.postMessage) {
      w.ReactNativeWebView.postMessage(JSON.stringify(msg));
    } else {
      // Web 환경일 땐 그냥 console 로 fallback
      console.log('[WEB DEBUG]', tag, payload);
    }
  } catch (e) {
    console.log('[WEB DEBUG][FAIL]', tag, e);
  }
}
