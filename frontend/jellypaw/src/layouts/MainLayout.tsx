import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MenuBar from '../ui/components/MenuBar';

// 메인 레이아웃 타입
interface MainLayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  showMenuBar?: boolean;
}

// 메인 레이아웃
export default function MainLayout({
  children,
  style,
  backgroundColor = '#FAFAFA',
  showMenuBar = true,
}: MainLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top,
            paddingHorizontal: 16,
          },
        ]}
      >
        {children}
      </View>
      {showMenuBar && <MenuBar />}
    </View>
  );
}

// 메인 레이아웃 스타일
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
