import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import KakaoLoginScreen from '../screens/auth/KakaoLoginScreen';
import SignupWebViewScreen from '../screens/auth/SignupWebViewScreen';
import SelectCategory from '../screens/main/Write/SelectCategory';
import FeedWrite from '../screens/main/Write/FeedWrite';

export type RootStackParamList = {
  KakaoLogin: undefined;
  SignupWebView: undefined;
  SelectCategory: undefined;
  FeedWrite: { categoryId: number; categoryName: string };
};

type StackParam = RootStackParamList;
const Stack = createNativeStackNavigator<StackParam>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="KakaoLogin"
      >
        <Stack.Screen name="KakaoLogin" component={KakaoLoginScreen} />
        <Stack.Screen name="SignupWebView" component={SignupWebViewScreen} />
        <Stack.Screen name="SelectCategory" component={SelectCategory} />
        <Stack.Screen name="FeedWrite" component={FeedWrite} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
