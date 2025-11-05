import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SelectCategory from '../screens/main/Write/SelectCategory';
import FeedWrite from '../screens/main/Write/FeedWrite';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type MainStackParamList = {
  SelectCategory: undefined;
  FeedWrite: { categoryId: number; categoryName: string };
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStackNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top }]}>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="SelectCategory"
        >
          <Stack.Screen name="SelectCategory" component={SelectCategory} />
          <Stack.Screen name="FeedWrite" component={FeedWrite} />
        </Stack.Navigator>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
  },
});
