import apiClient from '../../lib/apiClient';
import { sendFcmTokenResponse } from '../../types/fcm';

// FCM 토큰 전송
const sendFcmToken = async (fcmToken: string) => {
    const response = await apiClient.post<sendFcmTokenResponse>(`users/fcm-token?fcmToken=${fcmToken}`);
    console.log('response', response);
    return response.data;
}

export default sendFcmToken;