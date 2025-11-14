// src/components/ui/input.tsx
import * as React from 'react';
import { IoSearch } from 'react-icons/io5';
import { cn } from '@/lib/utils';

type JellyInputProps = React.ComponentProps<'input'> & {
  errorText?: string;
  helperText?: string;
  helperTextClassName?: string;
  containerClassName?: string;
};

const Input = React.forwardRef<HTMLInputElement, JellyInputProps>(
  ({ className, type, errorText, helperText, helperTextClassName, containerClassName, ...props }, ref) => {
    const showError = !!errorText;
    const showHelper = !showError && !!helperText;

    const baseInputClass =
      'flex h-12 rounded-[12px] border border-input bg-white-100 py-3 placeholder:text-gray-300 placeholder:text-sm placeholder:leading-[1.5] placeholder:font-normal focus:outline-none focus-visible:outline-none focus-visible:ring-0.5';

    const normalFocusClass = 'focus-visible:border-aqua-300 focus-visible:ring-aqua-300';
    const errorFocusClass =
      'border-[#e85555] focus-visible:border-[#e85555] focus-visible:ring-[#e85555]/30';

    const inputClassName = cn(
      baseInputClass,
      showError ? errorFocusClass : normalFocusClass,
      type === 'search'
        ? 'w-full pl-12 pr-3 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-cancel-button]:hidden [&::-ms-clear]:hidden'
        : 'w-full px-4',
      className,
    );

    const inputElement = (
      <input
        ref={ref}
        type={type}
        className={inputClassName}
        {...props}
      />
    );

    const renderedInput =
      type === 'search' ? (
        <div className="relative w-full">
          <IoSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
          {inputElement}
        </div>
      ) : (
        inputElement
      );

    return (
      <div className={cn('w-full mb-5', containerClassName)}>
        {renderedInput}

        {showError && (
          <p className="mt-1.5 text-xs text-[#e85555]">{errorText}</p>
        )}

        {showHelper && (
          <p className={cn('mt-1.5 text-xs text-[#999999]', helperTextClassName)}>
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
