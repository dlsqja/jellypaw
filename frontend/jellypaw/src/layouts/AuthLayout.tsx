// SafeAreaLayout.tsx - 모든 화면에 적용할 공통 레이아웃
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 인증 레이아웃 타입
interface AuthLayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
}

// 인증 레이아웃
export default function AuthLayout({
  children,
  style,
  backgroundColor = '#FAFAFA',
}: AuthLayoutProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          paddingTop: insets.top,

        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// 인증 레이아웃 스타일
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
