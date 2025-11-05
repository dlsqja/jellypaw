import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStackNavigator from './auth/AuthStackNavigator';
import FeedNavigator from './FeedNavigator';
import FeedWriteNavigator from './FeedWriteNavigator';
import PetNavigator from './PetNavigator';
import type { FeedStackParamList } from './FeedNavigator';
import type { FeedWriteStackParamList } from './FeedWriteNavigator';
import type { PetStackParamList } from './PetNavigator';

// stack param list
export type RootStackParamList = {
  AuthStack: undefined;
  FeedStack:
    | undefined
    | {
        screen: keyof FeedStackParamList;
        params?: FeedStackParamList[keyof FeedStackParamList];
      };
  FeedWriteStack:
    | undefined
    | {
        screen: keyof FeedWriteStackParamList;
        params?: FeedWriteStackParamList[keyof FeedWriteStackParamList];
      };
  PetStack:
    | undefined
    | {
        screen: keyof PetStackParamList;
        params?: PetStackParamList[keyof PetStackParamList];
      };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// 루트 네비게이터
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="AuthStack"
      >
        {/* 로그인/회원가입 */}
        <Stack.Screen name="AuthStack" component={AuthStackNavigator} />
        {/* 피드 */}
        <Stack.Screen name="FeedStack" component={FeedNavigator} />
        {/* 피드 작성 */}
        <Stack.Screen name="FeedWriteStack" component={FeedWriteNavigator} />
        {/* 동물관리 */}
        <Stack.Screen name="PetStack" component={PetNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// 각 네비게이션 타입 내보내기
export type { AuthStackParamList } from './auth/AuthStackNavigator';
export type { FeedStackParamList } from './FeedNavigator';
export type { FeedWriteStackParamList } from './FeedWriteNavigator';
export type { PetStackParamList } from './PetNavigator';
