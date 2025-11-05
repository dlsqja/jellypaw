import React from 'react';
import FeedScreen from '../screens/main/Feed/FeedScreen';
import MainLayout from '../layouts/MainLayout';

export type FeedStackParamList = {
  Feed: undefined;
};

// 피드 네비게이터
export default function FeedNavigator() {
  return (
    <MainLayout>
      <FeedScreen />
    </MainLayout>
  );
}
