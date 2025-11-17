import * as React from 'react';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { DayButton, DayPicker, getDefaultClassNames } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      defaultMonth={props.defaultMonth ?? new Date()}
      className={cn(
        'bg-white group/calendar p-2 max-w-[360px] [--cell-size:calc((100%-2rem)/7)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString('default', { month: 'short' }),
        formatCaption: (date) => {
          const year = date.getFullYear();
          const month = date.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1
          return `${year}.${month}`;
        },
        formatWeekdayName: (date) => {
          const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
          return weekdays[date.getDay()];
        },
        ...formatters,
      }}
      classNames={{
        root: cn('w-full', defaultClassNames.root),
        months: cn('relative flex flex-col gap-4 md:flex-row', defaultClassNames.months),
        month: cn('flex w-full flex-col gap-4', defaultClassNames.month),
        nav: cn('absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1 pt-2', defaultClassNames.nav),
        button_previous: cn(
          buttonVariants({ tone: 'white', shape: 'solid', size: 'sm' }),
          'h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50',
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ tone: 'white', shape: 'solid', size: 'sm' }),
          'h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50',
          defaultClassNames.button_next,
        ),
        month_caption: cn('flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]', defaultClassNames.month_caption),
        dropdowns: cn('flex h-[--cell-size] w-full items-center justify-center gap-1.5 text-sm font-medium', defaultClassNames.dropdowns),
        dropdown_root: cn(
          'has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border',
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn('bg-popover absolute inset-0 opacity-0', defaultClassNames.dropdown),
        caption_label: cn(
          'select-none pt-1',
          captionLayout === 'label'
            ? 'p1-b'
            : '[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 pt-1 text-sm [&>svg]:size-3.5',
          defaultClassNames.caption_label,
        ),
        table: 'w-full border-collapse table-fixed',
        weekdays: cn('flex w-full', defaultClassNames.weekdays),
        weekday: cn('text-gray-300 flex-1 select-none rounded-md text-[0.8rem] font-normal min-w-0', defaultClassNames.weekday),
        week: cn('mt-2 flex w-full', defaultClassNames.week),
        week_number_header: cn('w-[--cell-size] select-none', defaultClassNames.week_number_header),
        week_number: cn('text-muted-foreground select-none text-[0.8rem]', defaultClassNames.week_number),
        day: cn('group/day relative aspect-square h-full w-full min-w-0 select-none p-0 text-center', defaultClassNames.day),
        range_start: cn('bg-accent rounded-l-md', defaultClassNames.range_start),
        range_middle: cn('rounded-none', defaultClassNames.range_middle),
        range_end: cn('bg-accent rounded-r-md', defaultClassNames.range_end),
        today: cn('bg-white text-accent-foreground rounded-md data-[selected=true]:rounded-none', defaultClassNames.today),
        outside: cn('text-muted-foreground aria-selected:text-muted-foreground', defaultClassNames.outside),
        disabled: cn('text-muted-foreground opacity-50', defaultClassNames.disabled),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />;
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return <ChevronLeftIcon className={cn('size-4', className)} {...props} />;
          }

          if (orientation === 'right') {
            return <ChevronRightIcon className={cn('size-4', className)} {...props} />;
          }

          return <ChevronDownIcon className={cn('size-4', className)} {...props} />;
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-[--cell-size] items-center justify-center text-center">{children}</div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({ className, day, modifiers, ...props }: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      tone="white"
      shape="solid"
      className={cn(
        'data-[selected-single=true]:bg-aqua-300 data-[selected-single=true]:text-white data-[selected-single=true]:border-0 flex aspect-square h-auto w-full p-0 flex-col gap-1 p2 leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 [&>span]:text-xs [&>span]:opacity-70',
        defaultClassNames.day,
        className,
      )}
      data-day={day.date.toLocaleDateString()}
      data-selected-single={modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle}
      // data-range-start={modifiers.range_start}
      // data-range-end={modifiers.range_end}
      // data-range-middle={modifiers.range_middle}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
