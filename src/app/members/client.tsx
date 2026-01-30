"use client"

import { useState } from "react"
import { Plus, CheckCircle2, Trash2 } from "lucide-react"
import { CreateMemberModal } from "@/components/modals/CreateMemberModal"
import { EditMemberModal } from "@/components/modals/EditMemberModal"
import { DeleteMemberModal } from "@/components/modals/DeleteMemberModal"

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
  projectNames: string[]
}

interface MembersClientProps {
  members: Member[]
  projects: Project[]
}

export function MembersClient({ members, projects }: MembersClientProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [deletingMember, setDeletingMember] = useState<Member | null>(null)

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setIsEditModalOpen(true)
  }

  const handleDelete = (member: Member) => {
    setDeletingMember(member)
    setIsDeleteModalOpen(true)
  }

  // 渲染项目访问权限
  const renderProjectAccess = (member: Member) => {
    if (member.role === "Admin") {
      return (
        <span className="text-[#AF52DE] font-medium flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> 全局访问
        </span>
      )
    }

    if (member.projectNames.length === 0) {
      return <span className="text-[#8E8E93]">无项目权限</span>
    }

    if (member.projectNames.length <= 2) {
      return (
        <span className="text-[#636366]">
          {member.projectNames.join("、")}
        </span>
      )
    }

    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[#636366]">
          {member.projectNames.slice(0, 2).join("、")}
        </span>
        <span className="bg-[#F5F5F7] text-[#8E8E93] px-1.5 py-0.5 rounded text-[11px]">
          +{member.projectNames.length - 2}
        </span>
      </div>
    )
  }

  return (
    <>
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-[28px] font-bold text-[#1d1d1f] tracking-tight leading-tight">
          成员权限
        </h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-b from-[#007AFF] to-[#0062CC] text-white px-5 py-2.5 rounded-full font-medium text-[13px] shadow-sm hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all duration-200 flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> 添加成员
        </button>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-white hover:border-[#007AFF]/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
        <table className="w-full text-left border-collapse">
          <thead className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider bg-[#FAFAFA] border-b border-[#F5F5F7]">
            <tr>
              <th className="px-6 py-4 pl-8">用户信息</th>
              <th className="px-6 py-4">系统角色</th>
              <th className="px-6 py-4">项目访问权</th>
              <th className="px-6 py-4 text-right">管理</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F5F7]">
            {members.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center">
                  <p className="text-[14px] text-[#8E8E93]">暂无成员，点击上方按钮添加</p>
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="hover:bg-[#F5F5F7] transition-colors group">
                  <td className="px-6 py-5 pl-8">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-[#F2F2F7] text-[#636366] flex items-center justify-center font-bold mr-3 border border-[#E5E5EA]">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-[#1d1d1f] text-[14px]">{member.name}</div>
                        <div className="text-[#86868b] text-[12px]">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-[12px] font-medium border ${
                        member.role === "Admin"
                          ? "bg-[#AF52DE]/5 text-[#AF52DE] border-[#AF52DE]/20"
                          : "bg-[#636366]/5 text-[#636366] border-[#636366]/10"
                      }`}
                    >
                      {member.role === "Admin" ? "系统管理员" : "普通成员"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-[13px]">
                    {renderProjectAccess(member)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(member)}
                        className="text-[#007AFF] bg-[#007AFF]/0 group-hover:bg-[#007AFF]/10 px-3 py-1.5 rounded-lg font-medium text-[12px] transition-all"
                      >
                        配置
                      </button>
                      <button
                        onClick={() => handleDelete(member)}
                        className="text-[#FF3B30] bg-[#FF3B30]/0 group-hover:bg-[#FF3B30]/10 p-1.5 rounded-lg transition-all"
                        title="删除成员"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <CreateMemberModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projects={projects}
      />

      {editingMember && (
        <EditMemberModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingMember(null)
          }}
          member={editingMember}
          projects={projects}
        />
      )}

      {deletingMember && (
        <DeleteMemberModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setDeletingMember(null)
          }}
          member={deletingMember}
        />
      )}
    </>
  )
}
