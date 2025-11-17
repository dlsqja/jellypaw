import React from 'react';
import MypageScreen from '../screens/main/Mypage/MypageScreen';
import WebviewLayout from '../layouts/WebviewLayout';

export type MypageStackParamList = {
  Mypage: undefined;
};

// 내 공간 네비게이터
export default function MypageNavigator() {
  return (
    <WebviewLayout>
      <MypageScreen />
    </WebviewLayout>
  );
}
