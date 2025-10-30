import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import type { IconType } from "react-icons"
import { cn } from "@/lib/utils"

const rootVariants = cva("inline-flex items-center select-none", {
  variants: {
    size: {
      sm: "h-5 gap-1.5",   
      md: "h-3 gap-2",     
      lg: "h-7 gap-2.5",   
    },
  },
  defaultVariants: { size: "md" },
})

// 아이콘: 크기 + 아이콘 색
const iconVariants = cva("shrink-0", {
  variants: {
    size: {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    },
    // 아이콘 색 설정
    iconTone: {
      aqua300: "text-aqua-300",
      gray300: "text-gray-300",
    },
  },
  defaultVariants: { size: "sm", iconTone: "aqua300" },
})

// 라벨: 텍스트 색 + 텍스트 스타일
const labelVariants = cva("", {
  variants: {
    textTone: {
      aqua500: "text-aqua-500",
      aqua300: "text-aqua-300",
    },
    textStyle: {
      "h6": "h6",
      "h6-b": "h6-b",
      "p2": "p2",

    },
  },
  defaultVariants: { textTone: "aqua500", textStyle: "h6" },
})

export interface IconTextProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof rootVariants>,
    Pick<VariantProps<typeof iconVariants>, "iconTone">,
    Pick<VariantProps<typeof labelVariants>, "textTone" | "textStyle"> {
  icon: IconType
  label: React.ReactNode
  asChild?: boolean
  iconClassName?: string
  labelClassName?: string
}

const IconText = React.forwardRef<HTMLDivElement, IconTextProps>(
  (
    {
      className,
      icon: Icon,
      label,
      asChild = false,
      size,
      iconTone,
      textTone,
      textStyle,
      iconClassName,
      labelClassName,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "div"
    return (
      <Comp ref={ref as any} className={cn(rootVariants({ size }), className)} {...props}>
        <Icon className={cn(iconVariants({ size, iconTone }), iconClassName)} aria-hidden="true" />
        <span className={cn(labelVariants({ textTone, textStyle }), labelClassName)}>
          {label}
        </span>
      </Comp>
    )
  }
)

IconText.displayName = "IconText"
export default IconText
