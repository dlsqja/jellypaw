import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-xl h-5 border px-2.5 py-0.5 p3-b font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-gray-200 text-aqua-500 w-[72px]',
        pink: 'border-transparent bg-pink-100 text-aqua-500 w-14',
        // destructive:
        //   "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        // outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
