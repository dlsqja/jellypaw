import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import KakaoLoginScreen from '../screens/auth/KakaoLoginScreen';
import SignupWebViewScreen from '../screens/auth/SignupWebViewScreen';
import AuthLayout from '../components/AuthLayout';

export type AuthStackParamList = {
  KakaoLogin: undefined;
  SignupWebView: { email?: string } | undefined;
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
        <Stack.Screen name="SignupWebView" component={SignupWebViewScreen} />
      </Stack.Navigator>
    </AuthLayout>
  );
}
