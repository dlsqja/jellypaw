import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import KakaoLoginScreen from '../screens/auth/KakaoLoginScreen';
import SignupWebViewScreen from '../screens/auth/SignupWebViewScreen';
import FeedWrite from '../screens/main/Write/FeedWrite';
import Step2 from '../screens/main/Write/Step2';
import PetManageScreen from '../screens/pets/PetManageScreen';
export type RootStackParamList = {
  KakaoLogin: undefined;
  SignupWebView: undefined;
  FeedWrite: undefined;
  Step2: { categoryId: number; categoryName: string };
  PetManage: undefined;

};

type StackParam = RootStackParamList;
const Stack = createNativeStackNavigator<StackParam>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="PetManage"
      >
        <Stack.Screen name="KakaoLogin" component={KakaoLoginScreen} />
        <Stack.Screen name="SignupWebView" component={SignupWebViewScreen} />
        <Stack.Screen name="FeedWrite" component={FeedWrite} />
        <Stack.Screen name="Step2" component={Step2} />
        <Stack.Screen name="PetManage" component={PetManageScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
