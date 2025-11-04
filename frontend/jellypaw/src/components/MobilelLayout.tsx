// SafeAreaLayout.tsx - 모든 화면에 적용할 공통 레이아웃
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeAreaLayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
}

export default function SafeAreaLayout({
  children,
  style,
  backgroundColor = '#FAFAFA',
}: SafeAreaLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
