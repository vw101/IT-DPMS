"use client"

import { useState, useTransition } from "react"
import { Modal } from "@/components/ui/Modal"
import { createParentTask } from "@/app/actions"
import { useRouter } from "next/navigation"

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
  projectName: string
}

export function CreateTaskModal({ isOpen, onClose, projectId, projectName }: CreateTaskModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [remark, setRemark] = useState("")
  const [devManDays, setDevManDays] = useState<string>("0")
  const [testManDays, setTestManDays] = useState<string>("0")
  const DESCRIPTION_MAX = 500

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      alert("请填写任务名称")
      return
    }

    if (description.length > DESCRIPTION_MAX) {
      alert(`任务描述不能超过 ${DESCRIPTION_MAX} 字符`)
      return
    }

    startTransition(async () => {
      try {
        await createParentTask({
          name: name.trim(),
          projectId,
          description: description.trim() || undefined,
          remark: remark.trim() || undefined,
          devManDays: parseFloat(devManDays) || 0,
          testManDays: parseFloat(testManDays) || 0,
        })
        
        // 重置表单
        setName("")
        setDescription("")
        setRemark("")
        setDevManDays("0")
        setTestManDays("0")
        
        onClose()
        router.refresh()
      } catch (error) {
        alert("创建任务失败，请重试")
        console.error(error)
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="添加任务项" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 项目名称（只读） */}
        <div>
          <label className="block text-[13px] font-medium text-[#8E8E93] mb-2">
            所属项目
          </label>
          <div className="px-4 py-3 bg-[#F5F5F7] rounded-[12px] text-[14px] text-[#636366]">
            {projectName}
          </div>
        </div>

        {/* 任务名称 */}
        <div>
          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
            任务名称 <span className="text-[#FF3B30]">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入任务名称"
            className="w-full px-4 py-3 bg-[#F5F5F7] border border-transparent rounded-[12px] text-[14px] text-[#1d1d1f] placeholder-[#8E8E93] focus:bg-white focus:border-[#007AFF]/30 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] outline-none transition-all"
            required
            autoFocus
          />
        </div>

        {/* 任务描述 */}
        <div>
          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
            任务描述
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_MAX))}
            placeholder="请输入任务描述（可选，最多 500 字）"
            rows={3}
            maxLength={DESCRIPTION_MAX}
            className="w-full px-4 py-3 bg-[#F5F5F7] border border-transparent rounded-[12px] text-[14px] text-[#1d1d1f] placeholder-[#8E8E93] focus:bg-white focus:border-[#007AFF]/30 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] outline-none transition-all resize-none"
          />
          <p className="text-[11px] text-[#8E8E93] mt-1 text-right">
            {description.length}/{DESCRIPTION_MAX}
          </p>
        </div>

        {/* 备注 */}
        <div>
          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
            备注
          </label>
          <input
            type="text"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="请输入备注（可选）"
            className="w-full px-4 py-3 bg-[#F5F5F7] border border-transparent rounded-[12px] text-[14px] text-[#1d1d1f] placeholder-[#8E8E93] focus:bg-white focus:border-[#007AFF]/30 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] outline-none transition-all"
          />
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
            disabled={isPending}
            className="bg-gradient-to-b from-[#007AFF] to-[#0062CC] text-white px-5 py-2.5 rounded-full font-medium text-[13px] shadow-sm hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "创建中..." : "添加任务"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
