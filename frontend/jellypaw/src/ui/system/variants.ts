// src/ui/system/variants.ts
import { StyleProp, ViewStyle, TextStyle } from 'react-native';

/** ========== 팔레트(원색 저장소) ========== */
export const palette = {
  aqua100: '#f0f7f9',
  aqua200: '#badfdb',
  aqua300: '#6abfb8',
  aqua400: '#4d8983',
  aqua500: '#284542',

  pink100: '#ffe0e0',
  pink400: '#e85555',

  gray100: '#FAFAFA',
  gray200: '#e5e5e5',
  gray400: '#A3A3A3',
  gray700: '#4B5563',
  gray800: '#111827',

  gold100: '#FCF9EA',
  gold200: '#F9F4D8',
  gold700: '#F7DE64',
  gold800: '#E6AF1F',

  green100: '#F0FDF4',
  green200: '#BBF7D0',
  green400: '#16A34A',

  white: '#ffffff',
  kakao: '#FEE500',
} as const;

/** ========== 전역 토큰(컴포넌트에서 참조) ========== */
export const theme = {
  // 아이콘 용도별 컬러
  icon: {
    active: palette.aqua300,
    inactive: palette.gray400,
    onBrand: palette.white,
  },

  // 텍스트 톤
  text: {
    primary: palette.aqua500,
    secondary: '#6B7280',
    muted: palette.gray700,
    onBrand: palette.white,
    onKakao: palette.aqua500, // 네 가이드: 검정 대신 aqua500
  },

  // 배경/테두리
  bg: {
    surface: palette.white,
    subtle: '#FAFAFA',
    brandSubtle: '#F0F7F9',
  },
  border: {
    default: palette.aqua300,
    gray: palette.gray200,
    pink: palette.pink400,
  },

  // 치수 토큰
  radius: {
    sm: 8,
    md: 12,
    pill: 9999 as const,
  },
  size: {
    btn: {
      default: { h: 52, px: 24, fs: 16 },
      sm: { h: 32, px: 16, fs: 14 },
      lg: { h: 64, px: 8, fs: 16 },
    },
  },
} as const;

/** ========== 버튼 variants ========== */
export type ButtonTone =
  | 'default'
  | 'aqua'
  | 'lightAqua'
  | 'white'
  | 'red'
  | 'kakao';
export type ButtonShape = 'solid' | 'outline' | 'pillSolid' | 'pillOutline';
export type ButtonSize = 'default' | 'sm' | 'lg';
export type ButtonBorderTone = 'default' | 'gray' | 'pink';
export type ButtonState = 'enabled' | 'disabled';

export interface ButtonVariantProps {
  tone?: ButtonTone;
  shape?: ButtonShape;
  size?: ButtonSize;
  borderTone?: ButtonBorderTone;
  state?: ButtonState;
}

// 배경/텍스트/보더 매핑(팔레트 기반)
const toneBg: Record<ButtonTone, string> = {
  default: palette.aqua300,
  aqua: palette.aqua300,
  lightAqua: palette.aqua100,
  white: palette.white,
  red: palette.pink100,
  kakao: palette.kakao,
};

const toneText: Record<ButtonTone, string> = {
  default: '#E9FAF8',
  aqua: '#E9FAF8',
  lightAqua: palette.aqua300,
  white: palette.aqua500, // 검은색 대신 aqua500
  red: '#EE6C99',
  kakao: palette.aqua500, // 검은색 대신 aqua500
};

const borderToneColor: Record<ButtonBorderTone, string> = {
  default: theme.border.default,
  gray: theme.border.gray,
  pink: theme.border.pink,
};

function getRadius(shape: ButtonShape) {
  if (shape === 'pillSolid' || shape === 'pillOutline')
    return theme.radius.pill;
  return theme.radius.md;
}

export function buttonVariants({
  tone = 'default',
  shape = 'solid',
  size = 'default',
  borderTone = 'default',
  state = 'enabled',
}: ButtonVariantProps): {
  container: StyleProp<ViewStyle>;
  text: StyleProp<TextStyle>;
} {
  const { h, px, fs } = theme.size.btn[size];
  const isOutline = shape === 'outline' || shape === 'pillOutline';

  // 복합(비활성 aqua → 살짝 옅은 톤)
  const disabledCompound =
    tone === 'aqua' && state === 'disabled'
      ? { backgroundColor: palette.aqua200 }
      : null;

  const container: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: h,
    paddingHorizontal: px,
    borderRadius: getRadius(shape),
    backgroundColor: isOutline ? 'transparent' : toneBg[tone],
    borderWidth: isOutline ? 1 : 0,
    borderColor: isOutline ? borderToneColor[borderTone] : 'transparent',
    opacity: state === 'disabled' ? 0.6 : 1,
    ...(disabledCompound ?? {}),
  };

  const text: TextStyle = {
    fontSize: fs,
    color: toneText[tone],
  };

  return { container, text };
}

/** ========== 아이콘 색 도우미(선택) ========== */
// 활성/비활성 아이콘 색을 일관되게 적용하기 위한 헬퍼
export function iconColor(active?: boolean) {
  return active ? theme.icon.active : theme.icon.inactive;
}
