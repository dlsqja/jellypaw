import { PermissionsAndroid, Platform } from 'react-native';
import apiClient from '../../lib/apiClient';
import { sendFcmTokenResponse } from '../../types/fcm';

// FCM 토큰 전송
const sendFcmToken = async (fcmToken: string) => {
  const response = await apiClient.post<sendFcmTokenResponse>(`users/fcm-token?fcmToken=${fcmToken}`);
  return response.data;
};

// 안드로이드 알림 권한 확인 + 요청 
export const ensureAndroidNotificationPermission = async (): Promise<boolean> => {
  // 안드로이드가 아니면 항상 true로 간주
  if (Platform.OS !== 'android') {
    return true;
  }

  // Android 13 미만은 별도 알림 권한이 없으므로 true로 간주
  const androidVersion = Number(Platform.Version);
  if (!Number.isNaN(androidVersion) && androidVersion < 33) {
    return true;
  }

  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );

    const granted = result === PermissionsAndroid.RESULTS.GRANTED;
    console.log('[Notification][Android] POST_NOTIFICATIONS result :: ', result, 'granted :: ', granted);
    return granted;
  } catch (error) {
    console.log('[Notification][Android] POST_NOTIFICATIONS request error :: ', error);
    return false;
  }
};

export default sendFcmToken;