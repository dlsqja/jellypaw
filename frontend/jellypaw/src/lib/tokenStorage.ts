// 안전한 저장소가 필요하면 react-native-keychain을 쓰세요.
// 여기선 간단히 AsyncStorage 사용
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS = 'accessToken';
const REFRESH = 'refreshToken';

export async function getAccessToken() {
  return AsyncStorage.getItem(ACCESS);
}
export async function getRefreshToken() {
  return AsyncStorage.getItem(REFRESH);
}
export async function setTokens(
  accessToken: string,
  refreshToken?: string | null,
) {
  await AsyncStorage.setItem(ACCESS, accessToken);
  if (refreshToken !== undefined) {
    if (refreshToken) await AsyncStorage.setItem(REFRESH, refreshToken);
    else await AsyncStorage.removeItem(REFRESH);
  }
}
export async function clearTokens() {
  await AsyncStorage.multiRemove([ACCESS, REFRESH]);
}
