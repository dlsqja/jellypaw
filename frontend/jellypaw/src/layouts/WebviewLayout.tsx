import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MenuBar from '../ui/components/MenuBar';
// 웹뷰 레이아웃 타입
interface WebviewLayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  showMenuBar?: boolean;
  boardId?: number;
}

// 메인 레이아웃
export default function WebviewLayout({
  children,
  style,
  backgroundColor = '#FAFAFA',
  showMenuBar = true,
  boardId, 
}: WebviewLayoutProps) {
  const insets = useSafeAreaInsets();

  const contentNode = React.isValidElement(children)
    ? React.cloneElement(children, { boardId } as any)
    : children;

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
          },
        ]}
      >
        {contentNode}
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
