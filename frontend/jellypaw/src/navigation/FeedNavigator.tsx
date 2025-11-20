import React from 'react';
import FeedScreen from '../screens/main/Feed/FeedScreen';
import WebviewLayout from '../layouts/WebviewLayout';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from './RootNavigator';

export type FeedStackParamList = {
  Feed: { boardId?: number } | undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'FeedStack'>;


// 피드 네비게이터
export default function FeedNavigator({ route }: Props) {
  const nested = route.params;
  const feedParams = nested?.params as FeedStackParamList['Feed'] | undefined;
  const boardId = feedParams?.boardId;

  return (
    <WebviewLayout boardId={boardId}>
      <FeedScreen />
    </WebviewLayout>
  );
}