import * as React from 'react';
import { forwardRef } from 'react';
import { Pressable, ActivityIndicator, StyleSheet, TextStyle, StyleProp, ViewStyle } from 'react-native';
import { Text } from './Text';
import type { ButtonVariantProps } from '../system/variants';
import { buttonVariants } from '../system/variants';

export interface ButtonProps extends ButtonVariantProps {
  title?: string;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
  accessibilityLabel?: string;
  titleStyle?: TextStyle;
  style?: StyleProp<ViewStyle>;
}

export const Button = forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({ title, loading, disabled, onPress, children, titleStyle, style, ...variants }, ref) => {
    const { container, text } = buttonVariants({
      ...variants,
      state: disabled || loading ? 'disabled' : variants.state ?? 'enabled',
    });

    const textColor = (text as TextStyle)?.color as string | undefined;

    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        disabled={disabled || loading}
        android_ripple={{ color: '#00000022', foreground: true }}
        style={({ pressed }) => [container, pressed && !(disabled || loading) && styles.pressed, style]}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
        accessibilityLabel={title}
        hitSlop={8}
      >
        {loading ? <ActivityIndicator color={textColor} /> : children ? children : <Text style={[text, titleStyle]}>{title}</Text>}
      </Pressable>
    );
  },
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  pressed: { opacity: 0.9 },
});
