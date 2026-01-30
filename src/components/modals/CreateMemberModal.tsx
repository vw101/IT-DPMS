"use client"

import { useState, useTransition } from "react"
import { Modal } from "@/components/ui/Modal"
import { createMember } from "@/app/actions"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

interface Project {
  id: number
  name: string
}

interface CreateMemberModalProps {
  isOpen: boolean
  onClose: () => void
  projects: Project[]
}

export function CreateMemberModal({ isOpen, onClose, projects }: CreateMemberModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<"Admin" | "Normal">("Normal")
  const [selectedProjects, setSelectedProjects] = useState<number[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      alert("请填写姓名")
      return
    }

    if (!email.trim()) {
      alert("请填写邮箱")
      return
    }

    // 简单的邮箱验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert("请输入有效的邮箱地址")
      return
    }

    if (!password) {
      alert("请设置登录密码")
      return
    }

    if (password.length < 6) {
      alert("密码长度至少为6位")
      return
    }

    if (password !== confirmPassword) {
      alert("两次输入的密码不一致")
      return
    }

    startTransition(async () => {
      try {
        await createMember({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          projectIds: selectedProjects,
        })
        
        // 重置表单
        setName("")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setRole("Normal")
        setSelectedProjects([])
        
        onClose()
        router.refresh()
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message)
        } else {
          alert("添加成员失败，请重试")
        }
        console.error(error)
      }
    })
  }

  const toggleProject = (projectId: number) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="添加成员" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 姓名 */}
        <div>
          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
            姓名 <span className="text-[#FF3B30]">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入成员姓名"
            className="w-full px-4 py-3 bg-[#F5F5F7] border border-transparent rounded-[12px] text-[14px] text-[#1d1d1f] placeholder-[#8E8E93] focus:bg-white focus:border-[#007AFF]/30 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] outline-none transition-all"
            required
            autoFocus
          />
        </div>

        {/* 邮箱 */}
        <div>
          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
            邮箱 <span className="text-[#FF3B30]">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="请输入邮箱地址（用于登录）"
            className="w-full px-4 py-3 bg-[#F5F5F7] border border-transparent rounded-[12px] text-[14px] text-[#1d1d1f] placeholder-[#8E8E93] focus:bg-white focus:border-[#007AFF]/30 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] outline-none transition-all"
            required
          />
        </div>

        {/* 密码 */}
        <div>
          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
            登录密码 <span className="text-[#FF3B30]">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请设置登录密码（至少6位）"
              className="w-full px-4 py-3 pr-12 bg-[#F5F5F7] border border-transparent rounded-[12px] text-[14px] text-[#1d1d1f] placeholder-[#8E8E93] focus:bg-white focus:border-[#007AFF]/30 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] outline-none transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#636366] transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* 确认密码 */}
        <div>
          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
            确认密码 <span className="text-[#FF3B30]">*</span>
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="请再次输入密码"
            className="w-full px-4 py-3 bg-[#F5F5F7] border border-transparent rounded-[12px] text-[14px] text-[#1d1d1f] placeholder-[#8E8E93] focus:bg-white focus:border-[#007AFF]/30 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] outline-none transition-all"
            required
          />
          {password && confirmPassword && password !== confirmPassword && (
            <p className="text-[12px] text-[#FF3B30] mt-1">两次输入的密码不一致</p>
          )}
          {password && confirmPassword && password === confirmPassword && (
            <p className="text-[12px] text-[#34C759] mt-1">✓ 密码一致</p>
          )}
        </div>

        {/* 系统角色 */}
        <div>
          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
            系统角色 <span className="text-[#FF3B30]">*</span>
          </label>
          <div className="flex gap-3">
            <label
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-[12px] cursor-pointer transition-all border ${
                role === "Normal"
                  ? "bg-[#007AFF]/10 border-[#007AFF]/30 text-[#007AFF]"
                  : "bg-[#F5F5F7] border-transparent text-[#636366] hover:bg-[#EBEBEB]"
              }`}
            >
              <input
                type="radio"
                name="role"
                value="Normal"
                checked={role === "Normal"}
                onChange={() => setRole("Normal")}
                className="sr-only"
              />
              <span className="text-[13px] font-medium">普通成员</span>
            </label>
            <label
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-[12px] cursor-pointer transition-all border ${
                role === "Admin"
                  ? "bg-[#AF52DE]/10 border-[#AF52DE]/30 text-[#AF52DE]"
                  : "bg-[#F5F5F7] border-transparent text-[#636366] hover:bg-[#EBEBEB]"
              }`}
            >
              <input
                type="radio"
                name="role"
                value="Admin"
                checked={role === "Admin"}
                onChange={() => setRole("Admin")}
                className="sr-only"
              />
              <span className="text-[13px] font-medium">系统管理员</span>
            </label>
          </div>
          <p className="text-[11px] text-[#8E8E93] mt-2">
            {role === "Admin" ? "系统管理员拥有全局访问权限，可以管理所有项目" : "普通成员只能访问已授权的项目"}
          </p>
        </div>

        {/* 项目授权（多选） */}
        {role === "Normal" && (
          <div>
            <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
              项目授权
              <span className="text-[#8E8E93] font-normal ml-2">（可多选）</span>
            </label>
            <div className="bg-[#F5F5F7] rounded-[12px] p-3 max-h-[200px] overflow-y-auto">
              {projects.length === 0 ? (
                <p className="text-[13px] text-[#8E8E93] text-center py-4">暂无项目</p>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <label
                      key={project.id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                        selectedProjects.includes(project.id)
                          ? "bg-[#007AFF]/10 border border-[#007AFF]/30"
                          : "hover:bg-white border border-transparent"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => toggleProject(project.id)}
                        className="h-4 w-4 rounded border-[#C7C7CC] text-[#007AFF] focus:ring-[#007AFF]/30"
                      />
                      <span className="text-[13px] font-medium text-[#1d1d1f]">{project.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {selectedProjects.length > 0 && (
              <p className="text-[12px] text-[#34C759] mt-2">
                ✓ 已选择 {selectedProjects.length} 个项目
              </p>
            )}
          </div>
        )}

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
            {isPending ? "添加中..." : "添加成员"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
