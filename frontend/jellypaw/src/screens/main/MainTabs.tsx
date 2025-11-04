// MainTabs.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FeedWebView from './FeedWebView';
const Stack = createNativeStackNavigator();
export default function MainTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="Feed" component={FeedWebView} />
    </Stack.Navigator>
  );
}
