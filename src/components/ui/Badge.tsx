import { cn } from "@/lib/utils"
import React from "react"

export type BadgeStatus = 'Done' | 'In Progress' | 'Pending' | 'UAT' | 'Critical' | 'High'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: BadgeStatus
}

// 使用硬编码 hex 值确保样式正确渲染（Pending 提高对比度：amber-700 + border）
const statusConfig: Record<BadgeStatus, { bg: string; text: string; dot: string; label: string; border?: string }> = {
  'Done': {
    bg: 'bg-[#34C759]/10',
    text: 'text-[#248A3D]',
    dot: 'bg-[#34C759]',
    label: '完成'
  },
  'In Progress': {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    dot: 'bg-blue-500',
    label: '进行中'
  },
  'Pending': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    label: '待处理',
    border: 'border border-amber-100'
  },
  'UAT': {
    bg: 'bg-[#AF52DE]/10',
    text: 'text-[#893FB5]',
    dot: 'bg-[#AF52DE]',
    label: 'UAT测试'
  },
  'Critical': {
    bg: 'bg-[#FF3B30]/10',
    text: 'text-[#FF3B30]',
    dot: 'bg-[#FF3B30]',
    label: '紧急'
  },
  'High': {
    bg: 'bg-[#FF3B30]/10',
    text: 'text-[#FF3B30]',
    dot: 'bg-[#FF3B30]',
    label: '高优先级'
  },
}

export function Badge({ status, className, ...props }: BadgeProps) {
  const config = statusConfig[status] || statusConfig['Pending']
  const isCritical = status === 'Critical'

  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide flex items-center gap-1.5 w-fit",
        config.bg,
        config.text,
        config.border,
        className
      )}
      {...props}
    >
      {isCritical ? (
        <span className="flex h-1.5 w-1.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3B30] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF3B30]"></span>
        </span>
      ) : (
        <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)}></span>
      )}
      {config.label}
    </span>
  )
}
