import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SelectCategory from '../screens/main/FeedWrite/SelectCategory';
import FeedWrite from '../screens/main/FeedWrite/FeedWrite';
import MainLayout from '../layouts/MainLayout';

export type FeedWriteStackParamList = {
  SelectCategory: undefined;
  FeedWrite: {
    categoryId: number;
    categoryName: string;
    categoryValue: string;
  };
};

const Stack = createNativeStackNavigator<FeedWriteStackParamList>();

// 피드 작성 네비게이터
export default function FeedWriteNavigator() {
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
