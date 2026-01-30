"use client"

import { useState, useTransition, useEffect } from "react"
import { Modal } from "@/components/ui/Modal"
import { updateSubTask } from "@/app/actions"
import { useRouter } from "next/navigation"

interface User {
  id: number
  name: string
}

interface SubTask {
  id: number
  name: string
  status: string
  startDate: string | null
  dueDate: string | null
  ownerIds: number[]
  owners: { id: number; name: string }[]
  remark?: string | null
  devManDays?: number
  testManDays?: number
}

interface EditSubTaskModalProps {
  isOpen: boolean
  onClose: () => void
  parentTaskName: string
  subTask: SubTask
  users: User[]
}

export function EditSubTaskModal({ isOpen, onClose, parentTaskName, subTask, users }: EditSubTaskModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(subTask.name)
  const [status, setStatus] = useState(subTask.status)
  const [startDate, setStartDate] = useState(subTask.startDate || "")
  const [dueDate, setDueDate] = useState(subTask.dueDate || "")
  const [selectedOwners, setSelectedOwners] = useState<number[]>(subTask.ownerIds || [])
  const [notes, setNotes] = useState(subTask.remark ?? "")
  const [devManDays, setDevManDays] = useState<string>(String(subTask.devManDays ?? 0))
  const [testManDays, setTestManDays] = useState(String(subTask.testManDays ?? 0))

  // 当 subTask 改变时，更新表单
  useEffect(() => {
    setName(subTask.name)
    setStatus(subTask.status)
    setStartDate(subTask.startDate || "")
    setDueDate(subTask.dueDate || "")
    setSelectedOwners(subTask.ownerIds || [])
    setNotes(subTask.remark ?? "")
    setDevManDays(String(subTask.devManDays ?? 0))
    setTestManDays(String(subTask.testManDays ?? 0))
  }, [subTask])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      alert("请填写子事项名称")
      return
    }

    if (!status) {
      alert("请选择状态")
      return
    }

    if (selectedOwners.length === 0) {
      alert("请至少选择一名负责人")
      return
    }

    startTransition(async () => {
      try {
        await updateSubTask({
          id: subTask.id,
          name: name.trim(),
          status,
          startDate: startDate || null,
          dueDate: dueDate || null,
          ownerIds: selectedOwners,
          remark: notes.trim() || undefined,
          devManDays: parseFloat(devManDays) || 0,
          testManDays: parseFloat(testManDays) || 0,
        })
        
        onClose()
        router.refresh()
      } catch (error) {
        alert("更新子事项失败，请重试")
        console.error('Update error:', error)
      }
    })
  }

  const toggleOwner = (userId: number) => {
    setSelectedOwners(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="编辑子事项" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 主任务名称（只读） */}
        <div>
          <label className="block text-[13px] font-medium text-[#8E8E93] mb-2">
            主任务
          </label>
          <div className="px-4 py-3 bg-[#F5F5F7] rounded-[12px] text-[14px] text-[#636366] flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#007AFF]"></span>
            {parentTaskName}
          </div>
        </div>

        {/* 子事项名称 */}
        <div>
          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
            子事项名称 <span className="text-[#FF3B30]">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入子事项名称"
            className="w-full px-4 py-3 bg-[#F5F5F7] border border-transparent rounded-[12px] text-[14px] text-[#1d1d1f] placeholder-[#8E8E93] focus:bg-white focus:border-[#007AFF]/30 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] outline-none transition-all"
            required
          />
        </div>

        {/* 状态 */}
        <div>
          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
            状态 <span className="text-[#FF3B30]">*</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-3 bg-[#F5F5F7] border border-transparent rounded-[12px] text-[14px] text-[#1d1d1f] focus:bg-white focus:border-[#007AFF]/30 outline-none transition-all appearance-none cursor-pointer"
            required
          >
            <option value="">请选择状态</option>
            <option value="Pending">待处理</option>
            <option value="In Progress">进行中</option>
            <option value="Done">完成</option>
          </select>
        </div>

        {/* 开始和结束日期 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
              开始日期
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 bg-[#F5F5F7] border border-transparent rounded-[12px] text-[14px] text-[#1d1d1f] focus:bg-white focus:border-[#007AFF]/30 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
              截止日期
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 bg-[#F5F5F7] border border-transparent rounded-[12px] text-[14px] text-[#1d1d1f] focus:bg-white focus:border-[#007AFF]/30 outline-none transition-all"
            />
          </div>
        </div>

        {/* 资源估算 */}
        <div className="pt-2 border-t border-[#F5F5F7]">
          <p className="text-[12px] font-medium text-[#8E8E93] mb-3">资源估算</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">开发人天</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={devManDays}
                  onChange={(e) => setDevManDays(e.target.value || "0")}
                  className="flex-1 px-4 py-3 bg-[#F5F5F7] border border-transparent rounded-[12px] text-[14px] text-[#1d1d1f] focus:bg-white focus:border-[#007AFF]/30 outline-none transition-all"
                />
                <span className="text-[13px] text-[#8E8E93]">Days</span>
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">测试人天</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={testManDays}
                  onChange={(e) => setTestManDays(e.target.value || "0")}
                  className="flex-1 px-4 py-3 bg-[#F5F5F7] border border-transparent rounded-[12px] text-[14px] text-[#1d1d1f] focus:bg-white focus:border-[#007AFF]/30 outline-none transition-all"
                />
                <span className="text-[13px] text-[#8E8E93]">Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* 负责人 (多选) */}
        <div>
          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
            负责人 <span className="text-[#FF3B30]">*</span>
            <span className="text-[#8E8E93] font-normal ml-2">（可多选）</span>
          </label>
          <div className="bg-[#F5F5F7] rounded-[12px] p-3 max-h-[200px] overflow-y-auto">
            {users.length === 0 ? (
              <p className="text-[13px] text-[#8E8E93] text-center py-4">暂无可选成员</p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <label
                    key={user.id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                      selectedOwners.includes(user.id) 
                        ? 'bg-[#007AFF]/10 border border-[#007AFF]/30' 
                        : 'hover:bg-white border border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedOwners.includes(user.id)}
                      onChange={() => toggleOwner(user.id)}
                      className="h-4 w-4 rounded border-[#C7C7CC] text-[#007AFF] focus:ring-[#007AFF]/30"
                    />
                    <div className="h-7 w-7 rounded-full bg-[#E5E5EA] flex items-center justify-center text-[10px] font-bold text-[#636366]">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-[13px] font-medium text-[#1d1d1f]">{user.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          {selectedOwners.length > 0 && (
            <p className="text-[12px] text-[#34C759] mt-2">
              ✓ 已选择 {selectedOwners.length} 名负责人: {users.filter(u => selectedOwners.includes(u.id)).map(u => u.name).join(', ')}
            </p>
          )}
        </div>

        {/* 备注 */}
        <div>
          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
            备注
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="请输入备注信息（可选）"
            rows={2}
            className="w-full px-4 py-3 bg-[#F5F5F7] border border-transparent rounded-[12px] text-[14px] text-[#1d1d1f] placeholder-[#8E8E93] focus:bg-white focus:border-[#007AFF]/30 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] outline-none transition-all resize-none"
          />
        </div>

        {/* 按钮 */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#F5F5F7]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-[13px] font-medium text-[#636366] hover:bg-[#F5F5F7] transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isPending || selectedOwners.length === 0 || !status}
            className="bg-gradient-to-b from-[#007AFF] to-[#0062CC] text-white px-5 py-2.5 rounded-full font-medium text-[13px] shadow-sm hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "保存中..." : "保存修改"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
