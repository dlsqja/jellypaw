// src/ui/components/AppText.tsx
import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

export function AppText(props: TextProps) {
  return (
    <RNText
      {...props}
      style={[{ fontFamily: 'Pretendard-Regular' }, props.style]}
    />
  );
}
