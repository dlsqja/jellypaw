// src/lib/tokenStorage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

const ACCESS = 'accessToken';
const REFRESH = 'refreshToken';

export async function getAccessToken() {
  return AsyncStorage.getItem(ACCESS);
}
export async function getRefreshToken() {
  return AsyncStorage.getItem(REFRESH);
}

export async function setTokens(accessToken: string, refreshToken?: string | null) {
  await AsyncStorage.setItem(ACCESS, accessToken);
  if (refreshToken !== undefined) {
    if (refreshToken) await AsyncStorage.setItem(REFRESH, refreshToken);
    else await AsyncStorage.removeItem(REFRESH);
  }
  DeviceEventEmitter.emit('AUTH_CHANGED'); // ★ 추가
}

export async function clearTokens() {
  await AsyncStorage.multiRemove([ACCESS, REFRESH]);
  DeviceEventEmitter.emit('AUTH_CHANGED'); // ★ 추가
}
