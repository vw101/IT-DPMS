import { BadgeStatus } from "@/components/ui/Badge"
import { prisma } from "@/lib/prisma"
import { ProjectsPageClient } from "./client"

// 禁用缓存，确保数据始终是最新的
export const dynamic = 'force-dynamic'
export const revalidate = 0

// 状态驱动的色彩系统
const statusGradients: Record<string, { gradient: string; glow: string; iconBg: string }> = {
  'In Progress': {
    gradient: 'from-[#F0F7FF] via-[#E8F4FD] to-[#DBEAFE]',
    glow: 'bg-blue-400/20',
    iconBg: 'bg-gradient-to-br from-[#007AFF] to-[#0A84FF] text-white',
  },
  'Pending': {
    gradient: 'from-[#FFFBF0] via-[#FEF7E8] to-[#FEF3C7]',
    glow: 'bg-amber-400/20',
    iconBg: 'bg-gradient-to-br from-[#FF9500] to-[#FFCC00] text-white',
  },
  'UAT': {
    gradient: 'from-[#FAF5FF] via-[#F3E8FF] to-[#E9D5FF]',
    glow: 'bg-purple-400/20',
    iconBg: 'bg-gradient-to-br from-[#AF52DE] to-[#BF5AF2] text-white',
  },
  'Done': {
    gradient: 'from-[#F0FDF4] via-[#DCFCE7] to-[#BBF7D0]',
    glow: 'bg-green-400/20',
    iconBg: 'bg-gradient-to-br from-[#34C759] to-[#30D158] text-white',
  },
}

// 格式化预算显示
function formatBudget(budget: number | null, currency: string): string {
  if (!budget) return '$0'
  if (budget >= 1000000) {
    return `$${(budget / 1000000).toFixed(1)}M`
  }
  if (budget >= 1000) {
    return `$${(budget / 1000).toFixed(0)}K`
  }
  return `$${budget}`
}

export default async function ProjectsPage() {
  // 从数据库获取项目列表
  const projects = await prisma.project.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      pm: true,
      members: {
        include: {
          user: true,
        },
      },
      tasks: {
        where: {
          status: { not: 'Done' },
          dueDate: { lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  // 获取所有用户（用于新建项目时选择）
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      title: true,
    },
    orderBy: { name: 'asc' },
  })

  // 转换为组件期望的格式
  const projectList = projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description || undefined,
    owner: project.pm.name,
    progress: project.progress,
    status: project.status as BadgeStatus,
    projectType: project.projectType,
    members: project.members.length,
    urgentCount: project.tasks.length,
    budget: formatBudget(Number(project.budget), project.currency),
    memberIds: project.members.map((m) => m.user.id),
    memberUsers: project.members.slice(0, 3).map((m) => ({
      id: m.user.id,
      name: m.user.name,
      avatar: m.user.avatar,
    })),
  }))

  return (
    <ProjectsPageClient 
      projects={projectList}
      users={users}
      statusGradients={statusGradients}
    />
  )
}
