// src/ui/components/Text.tsx
// 전역 기본 Text 컴포넌트 - Pretendard 폰트가 자동 적용됩니다
import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';

export interface TextPropsWithWeight extends TextProps {
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
}

/**
 * Text - 전역 기본 Text 컴포넌트
 * assets 폴더의 Pretendard 폰트가 자동으로 적용됩니다.
 * react-native의 Text 대신 이 컴포넌트를 사용하세요.
 */
export const Text = React.forwardRef<RNText, TextPropsWithWeight>(
  ({ weight, style, ...props }, ref) => {
    // fontWeight를 fontFamily로 변환
    const getFontFamily = (weight?: string): string => {
      switch (weight) {
        case 'bold':
        case '700':
          return 'Pretendard-Bold';
        case '600':
        case 'semiBold':
          return 'Pretendard-SemiBold';
        case '500':
        case 'medium':
          return 'Pretendard-Medium';
        case 'regular':
        case '400':
        default:
          return 'Pretendard-Regular';
      }
    };

    // style에서 fontWeight와 fontFamily 추출
    const flattenedStyle = style
      ? Array.isArray(style)
        ? Object.assign({}, ...style)
        : style
      : {};
    const fontWeight = (flattenedStyle as TextStyle).fontWeight;
    const fontFamily = (flattenedStyle as TextStyle).fontFamily;

    // fontFamily가 직접 지정되어 있으면 그것을 사용, 아니면 weight 기반으로 결정
    const finalFontFamily = fontFamily
      ? fontFamily
      : getFontFamily(weight || (fontWeight ? String(fontWeight) : 'regular'));

    return (
      <RNText
        ref={ref}
        {...props}
        style={[
          {
            fontFamily: finalFontFamily,
          },
          style,
        ]}
      />
    );
  },
);

Text.displayName = 'Text';
