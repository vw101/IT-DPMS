"use client"

import { useState, useTransition } from "react"
import { Modal } from "@/components/ui/Modal"
import { createProject } from "@/app/actions"
import { useRouter } from "next/navigation"

interface User {
  id: number
  name: string
  email: string
  title: string | null
}

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  users: User[]
}

export function CreateProjectModal({ isOpen, onClose, users }: CreateProjectModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [projectType, setProjectType] = useState<"Change Requirement" | "Support">("Change Requirement")
  const [selectedMembers, setSelectedMembers] = useState<number[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      alert("请填写项目名称")
      return
    }

    if (selectedMembers.length === 0) {
      alert("请至少选择一名项目成员")
      return
    }

    startTransition(async () => {
      try {
        await createProject({
          name: name.trim(),
          description: description.trim() || undefined,
          projectType,
          pmId: selectedMembers[0], // 第一个成员作为PM
          memberIds: selectedMembers,
        })
        
        // 重置表单
        setName("")
        setDescription("")
        setProjectType("Change Requirement")
        setSelectedMembers([])
        
        onClose()
        router.refresh()
      } catch (error) {
        alert("创建项目失败，请重试")
        console.error(error)
      }
    })
  }

  const toggleMember = (userId: number) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="新建项目" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 项目名称 */}
        <div>
          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
            项目名称 <span className="text-[#FF3B30]">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入项目名称"
            className="w-full px-4 py-3 bg-[#F5F5F7] border border-transparent rounded-[12px] text-[14px] text-[#1d1d1f] placeholder-[#8E8E93] focus:bg-white focus:border-[#007AFF]/30 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] outline-none transition-all"
            required
            autoFocus
          />
        </div>

        {/* 项目类型 */}
        <div>
          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
            项目类型
          </label>
          <select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value as "Change Requirement" | "Support")}
            className="w-full px-4 py-3 bg-[#F5F5F7] border border-transparent rounded-[12px] text-[14px] text-[#1d1d1f] focus:bg-white focus:border-[#007AFF]/30 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="Change Requirement">Change Requirement（变更需求）</option>
            <option value="Support">Support（运维）</option>
          </select>
        </div>

        {/* 项目描述 */}
        <div>
          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
            项目描述
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="请输入项目描述（可选）"
            rows={3}
            className="w-full px-4 py-3 bg-[#F5F5F7] border border-transparent rounded-[12px] text-[14px] text-[#1d1d1f] placeholder-[#8E8E93] focus:bg-white focus:border-[#007AFF]/30 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] outline-none transition-all resize-none"
          />
        </div>

        {/* 项目成员 (多选) */}
        <div>
          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
            项目成员 <span className="text-[#FF3B30]">*</span>
            <span className="text-[#8E8E93] font-normal ml-2">（至少选择一名）</span>
          </label>
          <div className="bg-[#F5F5F7] rounded-[12px] p-3 max-h-[280px] overflow-y-auto">
            {users.length === 0 ? (
              <p className="text-[13px] text-[#8E8E93] text-center py-4">暂无可选成员</p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <label
                    key={user.id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                      selectedMembers.includes(user.id) 
                        ? 'bg-[#007AFF]/10 border border-[#007AFF]/30' 
                        : 'hover:bg-white border border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user.id)}
                      onChange={() => toggleMember(user.id)}
                      className="h-4 w-4 rounded border-[#C7C7CC] text-[#007AFF] focus:ring-[#007AFF]/30"
                    />
                    <div className="h-8 w-8 rounded-full bg-[#E5E5EA] flex items-center justify-center text-[11px] font-bold text-[#636366]">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#1d1d1f] truncate">{user.name}</p>
                      <p className="text-[11px] text-[#8E8E93] truncate">{user.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          {selectedMembers.length > 0 && (
            <p className="text-[12px] text-[#34C759] mt-2">
              ✓ 已选择 {selectedMembers.length} 名成员
            </p>
          )}
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
            disabled={isPending || selectedMembers.length === 0}
            className="bg-gradient-to-b from-[#007AFF] to-[#0062CC] text-white px-5 py-2.5 rounded-full font-medium text-[13px] shadow-sm hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "创建中..." : "创建项目"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
