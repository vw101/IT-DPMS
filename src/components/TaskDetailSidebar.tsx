"use client"

import { useEffect, useState } from "react"
import { X, Edit, History } from "lucide-react"
import { Badge, BadgeStatus } from "@/components/ui/Badge"
import type { TaskTreeNode } from "@/app/projects/[id]/page"

interface TaskDetailSidebarProps {
  isOpen: boolean
  onClose: () => void
  task: TaskTreeNode | null
  parentName?: string
  onEdit?: () => void
  onViewHistory?: () => void
}

function Facepile({ owners }: { owners: { id: number; name: string }[] }) {
  if (owners.length === 0) return <span className="text-gray-400 text-sm">未指定</span>
  const names = owners.map(o => o.name).join('、')
  const visible = owners.slice(0, 4)
  const extra = owners.length - 4
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex -space-x-1.5">
        {visible.map((owner, idx) => (
          <div
            key={owner.id}
            className="h-7 w-7 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 flex items-center justify-center text-[11px] font-semibold ring-2 ring-white flex-shrink-0"
            style={{ zIndex: 10 - idx }}
            title={owner.name}
          >
            {owner.name.charAt(0).toUpperCase()}
          </div>
        ))}
        {extra > 0 && (
          <div className="h-7 w-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-medium ring-2 ring-white flex-shrink-0" style={{ zIndex: 0 }}>
            +{extra}
          </div>
        )}
      </div>
      <span className="text-sm text-gray-500">{names}</span>
    </div>
  )
}

export function TaskDetailSidebar({
  isOpen,
  onClose,
  task,
  parentName,
  onEdit,
  onViewHistory,
}: TaskDetailSidebarProps) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (isOpen) {
      setVisible(false)
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
      return () => cancelAnimationFrame(t)
    } else {
      setVisible(false)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
      {/* 极淡透明遮罩，仅用于点击关闭，左侧表格仍可见 */}
      <div
        className="absolute inset-0 bg-black/[0.04] pointer-events-auto transition-opacity duration-300"
        onClick={onClose}
        aria-hidden
      />
      {/* Sidebar：深邃阴影，无深色背板 */}
      <div
        className={`relative w-full max-w-md bg-white flex flex-col h-full pointer-events-auto transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ boxShadow: "-10px 0 30px -5px rgba(0,0,0,0.1)" }}
        role="dialog"
        aria-label="任务详情"
      >
        {/* Header：任务名 + 紧凑元数据区 */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-100 flex-shrink-0">
          <div className="min-w-0 flex-1">
            {parentName && (
              <p className="text-xs text-gray-500 mb-1 truncate">{parentName}</p>
            )}
            <h2 className="text-[18px] font-semibold text-gray-900 leading-tight break-words">
              {task?.name ?? ""}
            </h2>
            {/* 元数据网格：一行 [状态] | [负责人]，下一行 开始/截止 */}
            {task && (
              <div className="mt-3 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge status={task.status as BadgeStatus} />
                  <span className="text-gray-300">|</span>
                  <Facepile owners={task.owners} />
                </div>
                <p className="text-xs text-gray-500">
                  开始：{task.startDate ?? "—"}　截止：{task.dueDate === "待定" ? "待定" : task.dueDate}
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900 flex-shrink-0"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {task && (
          <>
            {/* 正文区：杂志化，无灰底无边框 */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* 任务描述 */}
              <section className="mb-8">
                <h3 className="text-sm font-medium text-gray-500 mb-2">任务描述</h3>
                {task.description?.trim() ? (
                  <div className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap break-words">
                    {task.description.trim()}
                  </div>
                ) : (
                  <p className="text-base text-gray-400 italic">暂无描述</p>
                )}
              </section>

              <div className="border-b border-gray-100 mb-8" />

              {/* 备注 */}
              <section className="mb-8">
                <h3 className="text-sm font-medium text-gray-500 mb-2">备注</h3>
                {task.remark?.trim() ? (
                  <div className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap break-words">
                    {task.remark.trim()}
                  </div>
                ) : (
                  <p className="text-base text-gray-400 italic">暂无备注</p>
                )}
              </section>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-6 pt-0 flex flex-wrap gap-2 border-t border-gray-100">
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium text-[#007AFF] bg-[#007AFF]/10 hover:bg-[#007AFF]/20 transition-colors"
                >
                  <Edit className="h-4 w-4" /> 编辑
                </button>
              )}
              {onViewHistory && (
                <button
                  type="button"
                  onClick={onViewHistory}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <History className="h-4 w-4" /> 历史记录
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
