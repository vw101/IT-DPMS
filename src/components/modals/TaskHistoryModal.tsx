"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/Modal"
import { getTaskHistory } from "@/app/actions"
import { Clock, User, FileText, Plus, Edit, Trash2 } from "lucide-react"

interface TaskHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  task: {
    id: number
    name: string
  }
}

interface HistoryItem {
  id: number
  action: string
  details: string
  userName: string
  createdAt: string
}

const actionLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  'CREATE_TASK': { label: '创建任务', icon: <Plus className="h-3.5 w-3.5" />, color: 'bg-[#34C759]/10 text-[#34C759]' },
  'UPDATE_TASK': { label: '更新任务', icon: <Edit className="h-3.5 w-3.5" />, color: 'bg-[#007AFF]/10 text-[#007AFF]' },
  'DELETE_TASK': { label: '删除任务', icon: <Trash2 className="h-3.5 w-3.5" />, color: 'bg-[#FF3B30]/10 text-[#FF3B30]' },
  'CREATE_SUBTASK': { label: '创建子事项', icon: <Plus className="h-3.5 w-3.5" />, color: 'bg-[#34C759]/10 text-[#34C759]' },
  'UPDATE_SUBTASK': { label: '更新子事项', icon: <Edit className="h-3.5 w-3.5" />, color: 'bg-[#007AFF]/10 text-[#007AFF]' },
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins} 分钟前`
  if (diffHours < 24) return `${diffHours} 小时前`
  if (diffDays < 7) return `${diffDays} 天前`
  
  return date.toLocaleDateString('zh-CN', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function parseChanges(details: string): { field: string; old: string; new: string }[] {
  try {
    const parsed = JSON.parse(details)
    if (parsed.changes) {
      return Object.entries(parsed.changes)
        .filter(([, value]) => value !== undefined)
        .map(([field, value]) => ({
          field: field === 'name' ? '名称' : field === 'status' ? '状态' : field === 'owner' ? '负责人' : field,
          old: (value as { old?: string; new?: string }).old || '-',
          new: (value as { old?: string; new?: string }).new || '-',
        }))
    }
  } catch {
    // ignore
  }
  return []
}

export function TaskHistoryModal({ isOpen, onClose, task }: TaskHistoryModalProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && task.id) {
      setLoading(true)
      getTaskHistory(task.id)
        .then(setHistory)
        .finally(() => setLoading(false))
    }
  }, [isOpen, task.id])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="操作历史" size="md">
      <div className="space-y-4">
        {/* 任务名称 */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#F5F5F7] rounded-lg">
          <FileText className="h-4 w-4 text-[#8E8E93]" />
          <span className="text-[13px] text-[#636366]">{task.name}</span>
        </div>

        {/* 历史记录列表 */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-6 w-6 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[13px] text-[#8E8E93] mt-2">加载中...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="h-10 w-10 text-[#E5E5EA] mx-auto mb-3" />
              <p className="text-[14px] text-[#8E8E93]">暂无操作历史</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => {
                const actionInfo = actionLabels[item.action] || { 
                  label: item.action, 
                  icon: <FileText className="h-3.5 w-3.5" />, 
                  color: 'bg-[#8E8E93]/10 text-[#8E8E93]' 
                }
                const changes = parseChanges(item.details)

                return (
                  <div key={item.id} className="bg-[#FAFAFA] rounded-xl p-4 border border-[#F5F5F7]">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg ${actionInfo.color}`}>
                          {actionInfo.icon}
                        </span>
                        <span className="text-[13px] font-medium text-[#1d1d1f]">
                          {actionInfo.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#8E8E93]">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    
                    {/* 操作者 */}
                    <div className="flex items-center gap-1.5 text-[12px] text-[#8E8E93] mb-2">
                      <User className="h-3 w-3" />
                      <span>{item.userName}</span>
                    </div>

                    {/* 变更详情 */}
                    {changes.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[#E5E5EA]">
                        {changes.map((change, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[12px] mt-1">
                            <span className="text-[#8E8E93] w-12">{change.field}:</span>
                            <span className="text-[#FF3B30] line-through">{change.old}</span>
                            <span className="text-[#8E8E93]">→</span>
                            <span className="text-[#34C759]">{change.new}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
