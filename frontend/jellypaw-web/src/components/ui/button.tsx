import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      tone: {
        default: 'bg-aqua-300 text-aqua-100 hover:bg-aqua-400',
        aqua: 'bg-aqua-300 text-aqua-100 hover:bg-aqua-400',
        lightAqua: 'bg-aqua-100 text-aqua-300 hover:bg-aqua-200',
        white: 'bg-white text-aqua-500',
        red: 'bg-pink-100 text-pink-400',
      },
      shape: {
        // 단색
        solid: 'rounded-xl',
        // 테두리
        outline: 'rounded-xl border',
        // 둥근 모양 + 단색
        pillSolid: 'rounded-full',
        // 둥근 모양 + 테두리
        pillOutline: 'rounded-full border',
      },
      size: {
        // 기본 사이즈 버튼
        default: 'w-full h-12 px-4 p2-b',
        // 팔로우 버튼
        sm: 'w-16 h-8 px-4 p2-b',
        // 카테고리 및 큰 버튼
        lg: 'w-24 h-14 px-2 py-1',
        // icon: "h-9 w-9 p-0",
      },
      // 테두리 기본 색 아닐 경우 따로 설정할 것
      borderTone: {
        default: 'border-aqua-300',
        gray: 'border-gray-200',
        pink: 'border-pink-400',
      },
      state: {
        enabled: '',
        disabled: '',
      },
    },
    compoundVariants: [{ tone: 'aqua', state: 'disabled', class: 'bg-aqua-200 text-aqua-100 hover:bg-aqua-200' }],
    defaultVariants: {
      tone: 'default',
      shape: 'solid',
      size: 'default',
      borderTone: 'default',
      state: 'enabled',
    },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, tone, shape, size, borderTone, state, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ tone, shape, size, borderTone, state }), className)} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';
