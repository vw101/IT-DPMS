"use client"

import { useState } from "react"
import { TopBar } from "@/components/layout/TopBar"
import { BadgeStatus } from "@/components/ui/Badge"
import { Briefcase, Plus } from "lucide-react"
import { CreateProjectModal } from "@/components/modals/CreateProjectModal"
import { EditProjectModal } from "@/components/modals/EditProjectModal"
import { ProjectCard } from "@/components/ProjectCard"
import { getStatusLeftBorderColor } from "@/lib/formatters"

interface User {
  id: number
  name: string
  email: string
  title: string | null
}

interface Project {
  id: number
  name: string
  description?: string
  owner: string
  progress: number
  status: BadgeStatus
  projectType?: string
  members: number
  urgentCount: number
  budget: string
  memberIds: number[]
  memberUsers: {
    id: number
    name: string
    avatar: string | null
  }[]
}

interface ProjectsPageClientProps {
  projects: Project[]
  users: User[]
  statusGradients: Record<string, { gradient: string; glow: string; iconBg: string }>
}

const DONE_STATUSES = ['Done', '完成']

export function ProjectsPageClient({ projects, users, statusGradients }: ProjectsPageClientProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  // 默认只显示未完成的项目；可选「全部」（仍排除已删除）
  const [filterMode, setFilterMode] = useState<'unfinished' | 'all'>('unfinished')

  const displayedProjects =
    filterMode === 'unfinished'
      ? projects.filter((p) => !DONE_STATUSES.includes(p.status))
      : projects

  const handleEditProject = (e: React.MouseEvent, project: Project) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingProject(project)
    setIsEditModalOpen(true)
  }

  return (
    <div className="space-y-6 p-10">
      <TopBar />

      {/* 工具栏 - Pill 选中态：白底 + 细边框 + 微阴影 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] font-medium">
          <span className="text-[12px] text-slate-500">显示</span>
          <div className="flex items-center rounded-full bg-slate-100/80 p-1">
            <button
              type="button"
              onClick={() => setFilterMode('unfinished')}
              className={`px-3 py-1 rounded-full transition-all duration-200 text-[12px] ${
                filterMode === 'unfinished'
                  ? 'bg-white text-slate-900 border border-gray-200 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
              }`}
              aria-pressed={filterMode === 'unfinished'}
            >
              未完成
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-full transition-all duration-200 text-[12px] ${
                filterMode === 'all'
                  ? 'bg-white text-slate-900 border border-gray-200 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
              }`}
              aria-pressed={filterMode === 'all'}
            >
              全部
            </button>
          </div>
        </div>
        
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-b from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-lg font-medium text-[13px] shadow-lg shadow-blue-500/20 border-t border-white/20 active:scale-[0.98] transition-all duration-200 flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> 新建项目
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedProjects.length === 0 ? (
          <div className="col-span-full py-16 rounded-2xl flex flex-col items-center justify-center text-center bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.6)]">
            <div className="h-16 w-16 bg-blue-50/80 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
              <Briefcase className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-[16px] font-semibold text-slate-900">
              {filterMode === 'unfinished' ? '暂无未完成项目' : '暂无项目'}
            </h3>
            <p className="text-[13px] text-slate-500 mt-1">
              {filterMode === 'unfinished' ? '可切换为「全部」查看已完成项目，或点击上方按钮创建项目' : '点击上方按钮创建第一个项目'}
            </p>
          </div>
        ) : (
          displayedProjects.map((project) => {
            const effectiveVisualStatus =
              project.status === 'Done' || project.status === '完成'
                ? project.status
                : project.progress > 0
                ? 'In Progress'
                : project.status
            const leftBorderColor = getStatusLeftBorderColor(effectiveVisualStatus)
            const statusForBadge: BadgeStatus =
              effectiveVisualStatus === '完成'
                ? 'Done'
                : effectiveVisualStatus === '待处理'
                ? 'Pending'
                : effectiveVisualStatus === '进行中'
                ? 'In Progress'
                : (effectiveVisualStatus as BadgeStatus)

            return (
              <ProjectCard
                key={project.id}
                project={project}
                leftBorderColor={leftBorderColor}
                statusForBadge={statusForBadge}
                onEdit={handleEditProject}
              />
            )
          })
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        users={users}
      />

      {/* Edit Project Modal */}
      {editingProject && (
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingProject(null)
          }}
          project={{
            id: editingProject.id,
            name: editingProject.name,
            description: editingProject.description,
            projectType: editingProject.projectType,
            memberIds: editingProject.memberIds,
          }}
          users={users}
        />
      )}
    </div>
  )
}
