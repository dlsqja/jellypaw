import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import KakaoLoginScreen from '../screens/auth/KakaoLoginScreen';
import SignupWebViewScreen from '../screens/auth/SignupWebViewScreen';
import MainTabs from '../screens/main/MainTabs';

type StackParam = {
  KakaoLogin: undefined;
  SignupWebView: undefined;
  MainTabs: undefined;
};
const Stack = createNativeStackNavigator<StackParam>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="KakaoLogin">
        <Stack.Screen name="KakaoLogin" component={KakaoLoginScreen} />
        <Stack.Screen name="SignupWebView" component={SignupWebViewScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
