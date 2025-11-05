import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MenuBar from '../ui/components/MenuBar';

interface MainLayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  showMenuBar?: boolean;
}

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
          paddingTop: insets.top,
          paddingHorizontal: 16,
        },
        style,
      ]}
    >
      {children}
      {showMenuBar && <MenuBar />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
