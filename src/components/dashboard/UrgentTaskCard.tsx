import { Clock, Briefcase, ArrowRight, AlertTriangle } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { cn } from "@/lib/utils"

// 紧急任务类型定义
export interface UrgentItem {
  id: number
  title: string
  project: string
  due: string
  daysLeft: number
  status: string
  priority: string
  owner: string
  noDueDate?: boolean
}

interface UrgentTaskCardProps {
  item: UrgentItem
  urgentCount?: number
}

export function UrgentTaskCard({ item, urgentCount = 0 }: UrgentTaskCardProps) {
  const isOverdue = item.daysLeft <= 0 && !item.noDueDate // 已逾期
  const isUrgent = item.daysLeft <= 1 && !isOverdue // 紧急（1个工作日内）
  const isCritical = item.priority === 'Critical'

  const isUnassigned = item.owner === "未分配"

  return (
    <Card
      className={cn(
        "rounded-2xl p-4 border-l-4 border-l-red-500 bg-red-50/50 border border-red-200 shadow-[0_4px_12px_-2px_rgba(239,68,68,0.15)] relative overflow-hidden flex flex-col justify-between min-h-[120px] cursor-pointer group hover:shadow-[0_6px_16px_-2px_rgba(239,68,68,0.2)] hover:-translate-y-0.5 transition-all"
      )}
    >
      {/* Header: 截止日期/状态 - 降噪：text-red-400，视觉重心在标题与左侧红线 */}
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide bg-red-50/60 border border-red-200/50 text-red-400">
          {isOverdue ? (
            <AlertTriangle className="h-3 w-3 text-red-400 stroke-[2] fill-none shrink-0" />
          ) : (
            <Clock className="h-3 w-3 text-red-400 shrink-0" />
          )}
          {item.due}
        </div>
        {(isCritical || isOverdue) && (
          <span className="flex h-2 w-2 rounded-full bg-red-500 shrink-0" />
        )}
      </div>

      {/* Content: 标题强化阅读性 text-gray-900 font-semibold */}
      <div className="relative z-10">
        <h4 className="font-semibold leading-snug mb-0.5 group-hover:text-blue-600 transition-colors text-[15px] text-gray-900">
          {item.title}
        </h4>
        <div className="flex items-center gap-1.5 text-slate-500 text-[12px]">
          <Briefcase className="h-3 w-3" />
          {item.project}
        </div>
      </div>

      {/* Footer: 未分配用白底红字胶囊，浮于卡片之上 */}
      <div className="mt-3 pt-3 border-t border-red-100/80 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          {isUnassigned ? (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white text-red-600 shadow-sm">
              未分配
            </span>
          ) : (
            <>
              <div className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-semibold bg-gray-100 text-gray-600">
                {item.owner.charAt(0)}
              </div>
              <span className="text-[11px] text-gray-500">{item.owner}</span>
            </>
          )}
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 hover:bg-gray-200 p-1 rounded-md text-slate-700">
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {isOverdue && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-bl-lg">
          超期
        </div>
      )}
    </Card>
  )
}
