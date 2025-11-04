// src/ui/components/BackHeader.tsx
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Text } from './Text';

type Props = {
  title: string;
  onBackPress?: () => void;
  rightSlot?: React.ReactNode;
  showDivider?: boolean;
  fallbackRoute?: string;
};

export default function BackHeader({
  title,
  onBackPress,
  rightSlot,
  showDivider = false,
  fallbackRoute = 'KakaoLogin',
}: Props) {
  const navigation = useNavigation() as any;

  const handleBack = () => {
    if (onBackPress) return onBackPress();
    if (navigation.canGoBack?.()) navigation.goBack();
    else navigation.replace?.(fallbackRoute) ?? navigation.navigate(fallbackRoute);
  };

  return (
    <View style={[S.wrap, showDivider && S.divider]}>
      <View style={S.left}>
        <Pressable
          onPress={handleBack}
          hitSlop={10}
          android_ripple={{ color: '#00000012', borderless: true }}
          style={S.backBtn}
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
        >
          <Ionicons name="chevron-back" size={24} color="#284542" />
        </Pressable>
        <Text weight="bold" style={S.title}>{title}</Text>
      </View>
      <View style={S.right}>{rightSlot}</View>
    </View>
  );
}

const S = StyleSheet.create({
  wrap: {
    height: 60,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  divider: { borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
  title: { fontSize: 20, lineHeight: 28, color: '#284542' },
  right: { minWidth: 24, alignItems: 'flex-end', justifyContent: 'center' },
});
