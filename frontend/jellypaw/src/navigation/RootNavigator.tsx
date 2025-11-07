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
import SearchNavigator from './SearchNavigator.tsx';
import type { SearchStackParamList } from './SearchNavigator';
import MypageNavigator from './MypageNavigator';
import type { MypageStackParamList } from './MypageNavigator';

// stack param list
export type RootStackParamList = {
  AuthStack: undefined;
  FeedStack:
    | undefined
    | {
        screen: keyof FeedStackParamList;
        params?: FeedStackParamList[keyof FeedStackParamList];
      };
  SearchStack:
    | undefined
    | {
        screen: keyof SearchStackParamList;
        params?: SearchStackParamList[keyof SearchStackParamList];
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
  MypageStack:
    | undefined
    | {
        screen: keyof MypageStackParamList;
        params?: MypageStackParamList[keyof MypageStackParamList];
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
        {/* 피드 메인 - 웹뷰*/}
        <Stack.Screen name="FeedStack" component={FeedNavigator} />
        {/* 검색  - 웹뷰*/}
        <Stack.Screen name="SearchStack" component={SearchNavigator} />
        {/* 피드 작성 */}
        <Stack.Screen name="FeedWriteStack" component={FeedWriteNavigator} />
        {/* 동물관리 */}
        <Stack.Screen name="PetStack" component={PetNavigator} />
        {/* 내 공간  - 웹뷰*/}
        <Stack.Screen name="MypageStack" component={MypageNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// 각 네비게이션 타입 내보내기
export type { AuthStackParamList } from './auth/AuthStackNavigator';
export type { FeedStackParamList } from './FeedNavigator';
export type { SearchStackParamList } from './SearchNavigator';
export type { FeedWriteStackParamList } from './FeedWriteNavigator';
export type { PetStackParamList } from './PetNavigator';
export type { MypageStackParamList } from './MypageNavigator';
