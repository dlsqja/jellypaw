import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStackNavigator from './AuthStackNavigator';
import MainStackNavigator from './MainStackNavigator';
import type { MainStackParamList } from './MainStackNavigator';

export type RootStackParamList = {
  AuthStack: undefined;
  MainStack:
    | undefined
    | {
        screen: keyof MainStackParamList;
        params?: MainStackParamList[keyof MainStackParamList];
      };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="AuthStack"
      >
        <Stack.Screen name="AuthStack" component={AuthStackNavigator} />
        <Stack.Screen name="MainStack" component={MainStackNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Export types for use in other components
export type { AuthStackParamList } from './AuthStackNavigator';
export type { MainStackParamList } from './MainStackNavigator';
