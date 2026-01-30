"use client"

import { useState, useRef, useEffect, ReactNode } from "react"

interface TooltipProps {
  content: string
  children: ReactNode
  className?: string
  /** Primary = 深色 (Primary Info)；Secondary = 白/浅色 (Secondary Info) */
  variant?: "primary" | "secondary"
  /** 备注等靠右列用 left 防止溢出 */
  placement?: "bottom" | "left"
}

export function Tooltip({ content, children, className = "", variant = "primary", placement = "bottom" }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!visible || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const maxW = 320
    if (placement === "left") {
      setPosition({
        top: rect.top + rect.height / 2,
        left: Math.max(8, rect.left - maxW - 8),
      })
    } else {
      setPosition({
        top: rect.bottom + 6,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - maxW)),
      })
    }
  }, [visible, placement])

  const isPrimary = variant === "primary"
  const tooltipClass = isPrimary
    ? "fixed z-50 bg-slate-800 text-white rounded-md p-3 shadow-xl max-w-sm break-words text-[13px] leading-relaxed"
    : "fixed z-50 bg-white text-gray-800 border border-gray-200 rounded-md p-3 shadow-xl max-w-sm break-words text-[13px] leading-relaxed"

  return (
    <div
      ref={triggerRef}
      className={`inline-block ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={tooltipClass}
          style={{
            top: placement === "left" ? position.top : position.top,
            left: position.left,
            transform: placement === "left" ? "translateY(-50%)" : undefined,
          }}
        >
          {content}
        </div>
      )}
    </div>
  )
}
