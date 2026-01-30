import { TopBar } from "@/components/layout/TopBar"
import { UrgentTaskCard } from "@/components/dashboard/UrgentTaskCard"
import { GanttChart } from "@/components/dashboard/GanttChart"
import { Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { prisma } from "@/lib/prisma"

// 禁用缓存，确保数据始终是最新的
export const dynamic = 'force-dynamic'
export const revalidate = 0

// 计算工作日（排除周末）
function addWorkingDays(date: Date, days: number): Date {
  const result = new Date(date)
  let addedDays = 0
  
  while (addedDays < days) {
    result.setDate(result.getDate() + 1)
    const dayOfWeek = result.getDay()
    // 0 是周日，6 是周六
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++
    }
  }
  
  return result
}

// 计算剩余工作日
function calculateWorkingDaysLeft(dueDate: Date | null): number {
  if (!dueDate) return -1 // -1 表示没有截止日期
  
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  
  if (due < now) return 0 // 已逾期
  
  let workingDays = 0
  const current = new Date(now)
  
  while (current < due) {
    current.setDate(current.getDate() + 1)
    const dayOfWeek = current.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++
    }
  }
  
  return workingDays
}

// 格式化日期显示
function formatDueText(workingDaysLeft: number): string {
  if (workingDaysLeft === -1) return '无截止日期'
  if (workingDaysLeft <= 0) return '已逾期'
  if (workingDaysLeft === 1) return '剩 1 工作日'
  return `剩 ${workingDaysLeft} 工作日`
}

export default async function Home() {
  // 获取5个工作日后的日期
  const fiveWorkingDaysFromNow = addWorkingDays(new Date(), 5)

  // 获取所有未完成的主任务（父任务），包含子任务用于计算汇总日期
  const parentTasksWithChildren = await prisma.task.findMany({
    where: {
      parentId: null, // 只获取主任务
      project: {
        deletedAt: null, // 排除已删除的项目
      },
      status: {
        notIn: ['Done', '完成'], // 排除已完成的任务
      },
    },
    include: {
      project: true,
      owner: true,
      children: {
        select: {
          id: true,
          dueDate: true,
          startDate: true,
          status: true,
        },
      },
      owners: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: [
      { dueDate: 'asc' },
    ],
  })

  // 计算主任务的汇总数据（状态、日期都从子任务汇总）
  const tasksWithCalculatedData = parentTasksWithChildren.map((task) => {
    let effectiveDueDate = task.dueDate
    let effectiveStartDate = task.startDate
    let effectiveStatus = task.status
    
    // 如果有子任务，从子任务汇总计算
    if (task.children.length > 0) {
      // 汇总日期
      const childDueDates = task.children
        .map(c => c.dueDate)
        .filter((d): d is Date => d !== null)
      const childStartDates = task.children
        .map(c => c.startDate)
        .filter((d): d is Date => d !== null)
      
      // 截止日期取最晚的
      if (childDueDates.length > 0) {
        effectiveDueDate = new Date(Math.max(...childDueDates.map(d => d.getTime())))
      }
      // 开始日期取最早的
      if (childStartDates.length > 0) {
        effectiveStartDate = new Date(Math.min(...childStartDates.map(d => d.getTime())))
      }
      
      // 汇总状态：
      // - 所有子任务都是"完成/Done" → 主任务状态 = "完成"
      // - 至少有一个子任务是"进行中/In Progress" → 主任务状态 = "进行中"
      // - 所有子任务都是"待处理/Pending" → 主任务状态 = "待处理"
      const childStatuses = task.children.map(c => c.status)
      const allDone = childStatuses.every(s => s === 'Done' || s === '完成')
      const anyInProgress = childStatuses.some(s => s === 'In Progress' || s === '进行中')
      const allPending = childStatuses.every(s => s === 'Pending' || s === '待处理')
      
      if (allDone) {
        effectiveStatus = '完成'
      } else if (anyInProgress) {
        effectiveStatus = '进行中'
      } else if (allPending) {
        effectiveStatus = '待处理'
      } else {
        // 混合状态（有待处理和完成，但没有进行中）也视为进行中
        effectiveStatus = '进行中'
      }
    }
    
    // 获取负责人名称（从多负责人关系）
    const ownerNames = task.owners.length > 0
      ? task.owners.map(o => o.user.name).join(', ')
      : task.owner?.name || '未分配'
    
    return {
      ...task,
      effectiveDueDate,
      effectiveStartDate,
      effectiveStatus,
      ownerNames,
    }
  })
  
  // 过滤掉汇总状态为"完成"的任务（只显示未完成的）
  const tasksWithCalculatedDates = tasksWithCalculatedData.filter(
    task => task.effectiveStatus !== '完成' && task.effectiveStatus !== 'Done'
  )

  // 筛选紧急任务：
  // 1. 已逾期（截止日期已过但未完成）
  // 2. 截止日期在5个工作日内
  // 3. 无截止日期
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const urgentTasks = tasksWithCalculatedDates.filter((task) => {
    if (!task.effectiveDueDate) return true // 无截止日期视为紧急
    
    const dueDate = new Date(task.effectiveDueDate)
    dueDate.setHours(0, 0, 0, 0)
    
    // 已逾期（截止日期早于今天）
    if (dueDate < today) return true
    
    // 截止日期在5个工作日内
    return task.effectiveDueDate <= fiveWorkingDaysFromNow
  })

  // 转换为组件期望的格式（使用汇总后的状态）
  const urgentItems = urgentTasks.map((task) => {
    const workingDaysLeft = calculateWorkingDaysLeft(task.effectiveDueDate)
    
    return {
      id: task.id,
      title: task.name,
      project: task.project.name,
      due: formatDueText(workingDaysLeft),
      daysLeft: workingDaysLeft === -1 ? 999 : workingDaysLeft, // 无截止日期排在最后
      status: task.effectiveStatus, // 使用汇总后的状态
      priority: task.priority === 'Critical' ? 'Critical' : task.priority === 'High' ? 'High' : 'Medium',
      owner: task.ownerNames,
      noDueDate: task.effectiveDueDate === null,
    }
  })

  // 排序：已逾期 > 有截止日期（按剩余天数） > 无截止日期
  const sortedUrgentItems = [...urgentItems].sort((a, b) => {
    // 已逾期的排在最前面
    if (a.daysLeft <= 0 && b.daysLeft > 0) return -1
    if (b.daysLeft <= 0 && a.daysLeft > 0) return 1
    // 无截止日期的排在有截止日期的后面
    if (a.noDueDate && !b.noDueDate) return 1
    if (!a.noDueDate && b.noDueDate) return -1
    // 按剩余天数排序
    return a.daysLeft - b.daysLeft
  })

  const urgentCount = sortedUrgentItems.length

  // 使用已经查询的数据生成甘特图（复用上面查询的数据，避免重复查询）
  // 按项目ID和截止日期排序
  const sortedTasks = [...tasksWithCalculatedDates].sort((a, b) => {
    if (a.projectId !== b.projectId) return a.projectId - b.projectId
    if (!a.effectiveDueDate && !b.effectiveDueDate) return 0
    if (!a.effectiveDueDate) return 1
    if (!b.effectiveDueDate) return -1
    return a.effectiveDueDate.getTime() - b.effectiveDueDate.getTime()
  })

  // 转换为甘特图格式（使用子任务汇总的状态和日期）
  const ganttItems = sortedTasks.map((task) => ({
    id: task.id,
    name: task.name,
    project: task.project.name,
    projectId: task.projectId,
    status: task.effectiveStatus, // 使用汇总后的状态
    startDate: task.effectiveStartDate?.toISOString().split('T')[0] || null,
    endDate: task.effectiveDueDate?.toISOString().split('T')[0] || null,
  }))

  return (
    <div className="space-y-8 p-10">
      <TopBar />

      {/* Header Section - 精简，降低噪音 */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight leading-tight">
            风险预警中心
          </h1>
        </div>
      </div>

      {/* Dynamic Urgent Items Section - 紧凑标题 + 紧急逻辑说明 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-slate-600">
              <Zap className="h-4 w-4 text-red-500 stroke-[2] fill-none" />
              <h3 className="text-[13px] font-semibold tracking-tight text-slate-700">
                紧急交付 ({urgentCount})
              </h3>
            </div>
            <span className="text-[11px] text-gray-400 font-normal" title="已逾期、截止在 5 个工作日内或无截止日期的任务">
              （已逾期 / 5 工作日内 / 无截止日期）
            </span>
          </div>
          <span className="text-[11px] text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
            按截止日期排序
          </span>
        </div>

        <div
          className={cn(
            "grid gap-3",
            urgentCount <= 2
              ? "grid-cols-1 md:grid-cols-2"
              : urgentCount === 3
              ? "grid-cols-1 md:grid-cols-3"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          )}
        >
          {sortedUrgentItems.map((item) => (
            <UrgentTaskCard key={item.id} item={item} urgentCount={urgentCount} />
          ))}

          {urgentCount === 0 && (
            <div className="col-span-full py-10 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)]">
              <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                <svg className="h-6 w-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-[15px] font-semibold text-slate-900">目前没有紧急风险</h3>
              <p className="text-[12px] text-slate-500 mt-0.5">所有项目交付正常</p>
            </div>
          )}
        </div>
      </div>

      {/* Gantt Chart */}
      <div>
        <GanttChart items={ganttItems} />
      </div>
    </div>
  )
}
