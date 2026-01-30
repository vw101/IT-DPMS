import { notFound } from "next/navigation"
import { TopBar } from "@/components/layout/TopBar"
import { prisma } from "@/lib/prisma"
import { ProjectDetailClient } from "./client"

// 禁用缓存，确保数据始终是最新的
export const dynamic = 'force-dynamic'
export const revalidate = 0

// 定义任务树结构类型
export interface TaskTreeNode {
  id: number
  name: string
  description: string | null
  remark: string | null
  status: string
  priority: string
  startDate: string | null
  dueDate: string
  ownerIds: number[]
  owners: { id: number; name: string }[]
  devManDays?: number
  testManDays?: number
  children: TaskTreeNode[]
}

// 计算主任务的状态（基于子任务）
function calculateParentStatus(children: TaskTreeNode[]): string {
  if (children.length === 0) return 'Pending'
  
  const allDone = children.every(c => c.status === 'Done')
  if (allDone) return 'Done'
  
  const hasInProgress = children.some(c => c.status === 'In Progress')
  if (hasInProgress) return 'In Progress'
  
  const allPending = children.every(c => c.status === 'Pending')
  if (allPending) return 'Pending'
  
  return 'In Progress'
}

// 计算主任务的开始日期（子任务中最早的）
function calculateParentStartDate(children: TaskTreeNode[]): string | null {
  const dates = children
    .map(c => c.startDate)
    .filter((d): d is string => d !== null)
  
  if (dates.length === 0) return null
  
  dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  return dates[0]
}

// 计算主任务的截止日期（子任务中最晚的）
function calculateParentDueDate(children: TaskTreeNode[]): string {
  const dates = children
    .map(c => c.dueDate)
    .filter((d): d is string => d !== '待定')
  
  if (dates.length === 0) return '待定'
  
  dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  return dates[0]
}

// 计算主任务的负责人（子任务所有负责人去重集合）
function calculateParentOwners(children: TaskTreeNode[]): { id: number; name: string }[] {
  const ownerMap = new Map<number, string>()
  
  children.forEach(c => {
    c.owners.forEach(owner => {
      ownerMap.set(owner.id, owner.name)
    })
  })
  
  return Array.from(ownerMap.entries()).map(([id, name]) => ({ id, name }))
}

// 将平铺的任务数组转换为树结构
function buildTaskTree(tasks: {
  id: number
  name: string
  description: string | null
  remark: string | null
  status: string
  priority: string
  startDate: Date | null
  dueDate: Date | null
  parentId: number | null
  devManDays?: number
  testManDays?: number
  owners: { user: { id: number; name: string } }[]
}[]): TaskTreeNode[] {
  const taskMap = new Map<number, TaskTreeNode>()
  const roots: TaskTreeNode[] = []

  // 首先创建所有节点
  tasks.forEach((task) => {
    const taskOwners = task.owners.map(o => ({ id: o.user.id, name: o.user.name }))
    
    taskMap.set(task.id, {
      id: task.id,
      name: task.name,
      description: task.description ?? null,
      remark: task.remark ?? null,
      status: task.status,
      priority: task.priority,
      startDate: task.startDate
        ? task.startDate.toISOString().split('T')[0]
        : null,
      dueDate: task.dueDate
        ? task.dueDate.toISOString().split('T')[0]
        : '待定',
      ownerIds: taskOwners.map(o => o.id),
      owners: taskOwners.length > 0 ? taskOwners : [],
      devManDays: task.devManDays ?? 0,
      testManDays: task.testManDays ?? 0,
      children: [],
    })
  })

  // 构建树结构
  tasks.forEach((task) => {
    const node = taskMap.get(task.id)!
    if (task.parentId === null) {
      roots.push(node)
    } else {
      const parent = taskMap.get(task.parentId)
      if (parent) {
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    }
  })

  // 计算主任务的状态、日期和负责人（基于子任务）
  roots.forEach((root) => {
    if (root.children.length > 0) {
      root.status = calculateParentStatus(root.children)
      root.startDate = calculateParentStartDate(root.children)
      root.dueDate = calculateParentDueDate(root.children)
      root.owners = calculateParentOwners(root.children)
      root.ownerIds = root.owners.map(o => o.id)
    }
  })

  return roots
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const projectId = parseInt(id)

  if (isNaN(projectId)) {
    notFound()
  }

  // 获取项目详情
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      pm: true,
    },
  })

  if (!project || project.deletedAt) {
    notFound()
  }

  // 获取项目所有任务（包含多负责人）
  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      owners: {
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      },
    },
    orderBy: [
      { order: 'asc' },
      { createdAt: 'asc' },
    ],
  })

  // 获取所有用户（用于选择负责人）
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  })

  // 转换为树结构
  const taskTree = buildTaskTree(tasks)

  return (
    <div className="space-y-6 p-10">
      <TopBar />

      <ProjectDetailClient 
        project={{
          id: project.id,
          name: project.name,
        }}
        taskTree={taskTree}
        users={users}
      />
    </div>
  )
}
