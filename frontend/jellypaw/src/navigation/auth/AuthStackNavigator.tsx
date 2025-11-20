// src/navigation/auth/AuthStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import KakaoLoginScreen from '../../screens/auth/KakaoLoginScreen';
import SignupWebViewScreen from '../../screens/auth/SignupWebViewScreen';
import LoginBridgeScreen from '../../screens/auth/LoginBridgeScreen';
import AuthLayout from '../../layouts/AuthLayout';
import KakaoWebViewScreen from '../../screens/auth/KakaoWebViewScreen';
export type AuthStackParamList = {
  KakaoLogin: undefined;
  KakaoWebView: { authorizeUrl: string; incognito?: boolean };
  LoginBridge: { code: string };
  SignupWebView: { authId: number; email: string } | undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStackNavigator() {
  return (
    <AuthLayout>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="KakaoLogin"
      >
        <Stack.Screen name="KakaoLogin" component={KakaoLoginScreen} />
       <Stack.Screen name="KakaoWebView" component={KakaoWebViewScreen} />

        <Stack.Screen name="LoginBridge" component={LoginBridgeScreen} />
        <Stack.Screen name="SignupWebView" component={SignupWebViewScreen} />
      </Stack.Navigator>
    </AuthLayout>
  );
}
