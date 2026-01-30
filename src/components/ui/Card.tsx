import { cn } from "@/lib/utils"
import React from "react"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-enterprise-card rounded-[20px] shadow-soft-card border border-white hover:border-enterprise-blue/30 hover:shadow-hover-card transition-all duration-300",
        className
      )}
      {...props}
    />
  )
}
