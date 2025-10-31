import * as React from 'react';

import { cn } from '@/lib/utils';
import { IoSearch } from 'react-icons/io5';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ className, type, ...props }, ref) => {
  const inputElement = (
    <input
      type={type}
      className={cn(
        'flex h-12 rounded-[12px] border border-input bg-white-100 py-3 p2 placeholder:text-gray-300 placeholder:text-sm placeholder:leading-[1.5] placeholder:font-normal focus:outline-none focus-visible:outline-none focus-visible:ring-0',
        type === 'search'
          ? 'w-full pl-12 pr-3 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-cancel-button]:hidden [&::-ms-clear]:hidden'
          : 'w-full px-4',
        className,
      )}
      ref={ref}
      {...props}
    />
  );

  if (type === 'search') {
    return (
      <div className="relative w-full">
        <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={20} />
        {inputElement}
      </div>
    );
  }

  return inputElement;
});
Input.displayName = 'Input';

export { Input };
