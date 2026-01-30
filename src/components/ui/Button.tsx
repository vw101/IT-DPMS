import { cn } from "@/lib/utils"
import React from "react"

export type ButtonVariant = 'primary' | 'ghost' | 'outline'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-gradient-to-b from-enterprise-blue to-blue-600 text-white px-5 py-2.5 rounded-full font-medium text-[13px] shadow-sm hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all duration-200 flex items-center gap-1.5",
  ghost: "bg-transparent text-enterprise-text-primary hover:bg-black/5 rounded-full font-medium text-[13px] px-5 py-2.5 transition-all duration-200 flex items-center gap-1.5",
  outline: "bg-transparent border border-enterprise-border text-enterprise-text-primary hover:bg-enterprise-bg rounded-full font-medium text-[13px] px-5 py-2.5 transition-all duration-200 flex items-center gap-1.5",
}

export function Button({ 
  variant = 'primary', 
  className, 
  children,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
