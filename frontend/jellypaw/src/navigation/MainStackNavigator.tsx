import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SelectCategory from '../screens/main/Write/SelectCategory';
import FeedWrite from '../screens/main/Write/FeedWrite';
import MainLayout from '../components/MainLayout';

export type MainStackParamList = {
  SelectCategory: undefined;
  FeedWrite: { categoryId: number; categoryName: string };
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStackNavigator() {
  return (
    <MainLayout>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="SelectCategory"
      >
        <Stack.Screen name="SelectCategory" component={SelectCategory} />
        <Stack.Screen name="FeedWrite" component={FeedWrite} />
      </Stack.Navigator>
    </MainLayout>
  );
}
