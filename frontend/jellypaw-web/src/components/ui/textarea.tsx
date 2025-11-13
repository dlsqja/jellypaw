import * as React from 'react';

import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex h-25 w-full rounded-[12px] border border-gray-200 bg-white-100 px-4 py-3 p2 focus:outline-none focus-visible:outline-none focus-visible:border-aqua-300 focus-visible:ring-0.5 focus-visible:ring-aqua-300 resize-none',
        '[&::placeholder]:text-gray-300 [&::placeholder]:text-sm [&::placeholder]:leading-[1.5] [&::placeholder]:font-normal',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
