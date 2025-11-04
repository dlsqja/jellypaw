// src/ui/components/Button.tsx
import * as React from 'react';
import { forwardRef } from 'react';
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  TextStyle,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { AppText } from './AppText';
import type { ButtonVariantProps } from '../system/variants';
import { buttonVariants } from '../system/variants';

export interface ButtonProps extends ButtonVariantProps {
  title?: string;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  children?: React.ReactNode; // asChild 대용: 직접 children을 넣어도 됨
  accessibilityLabel?: string;
  titleStyle?: TextStyle;
  style?: StyleProp<ViewStyle>;
}

export const Button = forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(
  (
    { title, loading, disabled, onPress, children, titleStyle, ...variants },
    ref,
  ) => {
    const { container, text } = buttonVariants({
      ...variants,
      state: disabled || loading ? 'disabled' : variants.state ?? 'enabled',
    });

    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        disabled={disabled || loading}
        android_ripple={{ color: '#00000022', foreground: true }}
        style={({ pressed }) => [
          container,
          pressed && !(disabled || loading) && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityState={{
          disabled: !!(disabled || loading),
          busy: !!loading,
        }}
        accessibilityLabel={title}
      >
        {loading ? (
          <ActivityIndicator />
        ) : children ? (
          children
        ) : (
          <AppText style={[text, titleStyle]}>{title}</AppText>
        )}
      </Pressable>
    );
  },
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  pressed: { opacity: 0.9 },
});
