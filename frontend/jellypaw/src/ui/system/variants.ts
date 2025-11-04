import { StyleProp, ViewStyle, TextStyle } from 'react-native';

export type ButtonTone =
  | 'default'
  | 'aqua'
  | 'lightAqua'
  | 'white'
  | 'red'
  | 'kakao'; // 👈 kakao 추가

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

const colors = {
  aqua100: '#f0f7f9',
  aqua200: '#badfdb',
  aqua300: '#6abfb8',
  aqua400: '#4d8983',
  aqua500: '#284542',   
  pink100: '#ffe0e0',
  pink400: '#e85555',
  gray200: '#e5e5e5',
  white: '#ffffff',
  kakao: '#FEE500',
};

const baseContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  // RN gap은 아직 불안정 -> 필요 없으면 지우고, 여백은 내부 요소에 margin으로 처리 권장
  // gap: 8 as unknown as number,
};
const baseText: TextStyle = {};

const toneBg: Record<ButtonTone, string> = {
  default: colors.aqua300,
  aqua: colors.aqua300,
  lightAqua: colors.aqua100,
  white: colors.white,
  red: colors.pink100,
  kakao: colors.kakao, 
};

// “검은색 대신 aqua500” 요구 반영:
// - white 버튼 텍스트: aqua500
// - kakao 버튼 텍스트: aqua500 (원래는 #191600이 권장인데 네 가이드대로)
const toneText: Record<ButtonTone, string> = {
  default: '#E9FAF8',
  aqua: '#E9FAF8',
  lightAqua: colors.aqua300,
  white: colors.aqua500,  
  red: '#EE6C99',
  kakao: colors.aqua500,  
};

const borderToneColor: Record<ButtonBorderTone, string> = {
  default: colors.aqua300,
  gray: colors.gray200,
  pink: colors.pink400,
};

const sizeMap: Record<ButtonSize, { h: number; px: number; fs: number }> = {
  default: { h: 40, px: 16, fs: 14 },
  sm: { h: 32, px: 16, fs: 14 },
  lg: { h: 64, px: 8, fs: 16 },
};

function radius(shape: ButtonShape) {
  if (shape === 'pillSolid' || shape === 'pillOutline') return 9999;
  return 12;
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
  const { h, px, fs } = sizeMap[size];

  const isOutline = shape === 'outline' || shape === 'pillOutline';
  const disabledCompound =
    tone === 'aqua' && state === 'disabled'
      ? { backgroundColor: colors.aqua200 }
      : null;

  const container: ViewStyle = {
    ...baseContainer,
    height: h,
    paddingHorizontal: px,
    borderRadius: radius(shape),
    backgroundColor: isOutline ? 'transparent' : toneBg[tone],
    borderWidth: isOutline ? 1 : 0,
    borderColor: isOutline ? borderToneColor[borderTone] : 'transparent',
    opacity: state === 'disabled' ? 0.6 : 1,
    ...(disabledCompound ?? {}),
  };

  const text: TextStyle = {
    ...baseText,
    fontSize: fs,
    color: toneText[tone],
  };

  return { container, text };
}
