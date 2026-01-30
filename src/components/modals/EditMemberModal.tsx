"use client"

import { useState, useTransition, useEffect } from "react"
import { Modal } from "@/components/ui/Modal"
import { updateMember } from "@/app/actions"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Key } from "lucide-react"

interface Project {
  id: number
  name: string
}

interface Member {
  id: number
  name: string
  email: string
  role: "Admin" | "Normal"
  projectIds: number[]
}

interface EditMemberModalProps {
  isOpen: boolean
  onClose: () => void
  member: Member
  projects: Project[]
}

export function EditMemberModal({ isOpen, onClose, member, projects }: EditMemberModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(member.name)
  const [email, setEmail] = useState(member.email)
  const [role, setRole] = useState<"Admin" | "Normal">(member.role)
  const [selectedProjects, setSelectedProjects] = useState<number[]>(member.projectIds)
  
  // 密码修改相关
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // 当 member 改变时更新表单
  useEffect(() => {
    setName(member.name)
    setEmail(member.email)
    setRole(member.role)
    setSelectedProjects(member.projectIds)
    // 重置密码相关状态
    setShowPasswordSection(false)
    setNewPassword("")
    setConfirmPassword("")
  }, [member])

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

    // 如果要修改密码，验证密码
    if (showPasswordSection && newPassword) {
      if (newPassword.length < 6) {
        alert("密码长度至少为6位")
        return
      }
      if (newPassword !== confirmPassword) {
        alert("两次输入的密码不一致")
        return
      }
    }

    startTransition(async () => {
      try {
        await updateMember({
          id: member.id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: showPasswordSection && newPassword ? newPassword : undefined,
          role,
          projectIds: role === "Admin" ? [] : selectedProjects,
        })
        
        onClose()
        router.refresh()
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message)
        } else {
          alert("更新成员失败，请重试")
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

  const selectAllProjects = () => {
    setSelectedProjects(projects.map(p => p.id))
  }

  const clearAllProjects = () => {
    setSelectedProjects([])
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="成员配置" size="lg">
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

        {/* 密码修改 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[13px] font-medium text-[#1d1d1f]">
              登录密码
            </label>
            <button
              type="button"
              onClick={() => {
                setShowPasswordSection(!showPasswordSection)
                if (!showPasswordSection) {
                  setNewPassword("")
                  setConfirmPassword("")
                }
              }}
              className="flex items-center gap-1 text-[12px] text-[#007AFF] hover:text-[#0062CC] transition-colors"
            >
              <Key className="h-3.5 w-3.5" />
              {showPasswordSection ? "取消修改" : "修改密码"}
            </button>
          </div>
          
          {showPasswordSection ? (
            <div className="space-y-3 p-4 bg-[#F5F5F7] rounded-[12px]">
              <div>
                <label className="block text-[12px] text-[#636366] mb-1.5">新密码</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="请输入新密码（至少6位）"
                    className="w-full px-4 py-2.5 pr-10 bg-white border border-[#E5E5EA] rounded-lg text-[13px] text-[#1d1d1f] placeholder-[#8E8E93] focus:border-[#007AFF]/30 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#636366]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[12px] text-[#636366] mb-1.5">确认新密码</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入新密码"
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[13px] text-[#1d1d1f] placeholder-[#8E8E93] focus:border-[#007AFF]/30 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] outline-none transition-all"
                />
              </div>
              {newPassword && confirmPassword && (
                <p className={`text-[11px] ${newPassword === confirmPassword ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
                  {newPassword === confirmPassword ? '✓ 密码一致' : '✕ 两次输入的密码不一致'}
                </p>
              )}
            </div>
          ) : (
            <p className="text-[12px] text-[#8E8E93] bg-[#F5F5F7] px-4 py-3 rounded-[12px]">
              点击"修改密码"可以为该成员设置新的登录密码
            </p>
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-medium text-[#1d1d1f]">
                项目授权
                <span className="text-[#8E8E93] font-normal ml-2">（可多选）</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAllProjects}
                  className="text-[11px] text-[#007AFF] hover:underline"
                >
                  全选
                </button>
                <span className="text-[#C7C7CC]">|</span>
                <button
                  type="button"
                  onClick={clearAllProjects}
                  className="text-[11px] text-[#8E8E93] hover:underline"
                >
                  清空
                </button>
              </div>
            </div>
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
            {isPending ? "保存中..." : "保存配置"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
