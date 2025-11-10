// src/ui/components/Header.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { palette } from '../system/variants';

type Props = {
  title: string;
  rightSlot?: React.ReactNode;
  showDivider?: boolean;
  background?: 'surface' | 'subtle';
};

export default function Header({
  title,
  rightSlot,
  showDivider = false,
  background = 'surface',
}: Props) {
  return (
    <View
      style={[
        S.wrap,
        { backgroundColor: palette.gray100 },
        showDivider && S.divider,
      ]}
    >
      <Text weight="bold" style={S.title}>
        {title}
      </Text>
      <View style={S.right}>{rightSlot}</View>
    </View>
  );
}

const S = StyleSheet.create({
  wrap: {
    height: 60,
    // paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: { borderBottomWidth: 1, borderBottomColor: palette.gray200 },
  title: { fontSize: 20, lineHeight: 28, color: palette.aqua500 },
  right: {
    marginLeft: 'auto',
    minWidth: 24,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
