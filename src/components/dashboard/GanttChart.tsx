"use client"

import { useState, useMemo } from "react"
import { ChevronDown, ChevronRight, Calendar, Layers } from "lucide-react"

export interface GanttItem {
  id: number
  name: string
  project: string
  projectId: number
  status: string
  startDate: string | null
  endDate: string | null
}

interface GanttChartProps {
  items: GanttItem[]
}

// ===== 日期工具函数（定义在组件外部，避免重新创建） =====

// 解析日期字符串为本地日期的时间戳（毫秒）
// 输入: "2026-01-01" 输出: 该日期在本地时区00:00:00的时间戳
function parseDateToTimestamp(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day, 0, 0, 0, 0).getTime()
}

// 获取某个时间戳对应的日期字符串（用于调试）
function timestampToDateStr(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 计算两个时间戳之间的天数差
function daysDiff(ts1: number, ts2: number): number {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.round((ts2 - ts1) / oneDay)
}

// 获取时间戳对应日期是星期几 (0=周日, 1=周一, ...)
function getDayOfWeek(ts: number): number {
  return new Date(ts).getDay()
}

// 将时间戳调整到该周的周一
function adjustToMonday(ts: number): number {
  const day = getDayOfWeek(ts)
  const diff = day === 0 ? -6 : 1 - day // 周日往前6天，其他往前(day-1)天
  return ts + diff * 24 * 60 * 60 * 1000
}

// 格式化日期显示 (M/D)
function formatDateLabel(ts: number): string {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// 获取月份名称
function getMonthName(ts: number): string {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  return months[new Date(ts).getMonth()]
}

export function GanttChart({ items }: GanttChartProps) {
  const [viewMode, setViewMode] = useState<'gantt' | 'list'>('gantt')
  const [collapsedProjects, setCollapsedProjects] = useState<Set<number>>(new Set())

  const toggleProject = (projectId: number) => {
    setCollapsedProjects(prev => {
      const next = new Set(prev)
      if (next.has(projectId)) {
        next.delete(projectId)
      } else {
        next.add(projectId)
      }
      return next
    })
  }

  // 分离有日期和无日期的任务
  const { tasksWithDates, tasksWithoutDates } = useMemo(() => {
    const withDates: GanttItem[] = []
    const withoutDates: GanttItem[] = []
    items.forEach(item => {
      if (item.endDate) {
        withDates.push(item)
      } else {
        withoutDates.push(item)
      }
    })
    return { tasksWithDates: withDates, tasksWithoutDates: withoutDates }
  }, [items])

  // 计算图表的时间范围和日期标签
  const chartConfig = useMemo(() => {
    if (tasksWithDates.length === 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayTs = today.getTime()
      return {
        chartStartTs: todayTs,
        chartEndTs: todayTs + 30 * 24 * 60 * 60 * 1000,
        totalDays: 30,
        dateLabels: [] as { ts: number; dayIndex: number; isMonthStart: boolean }[],
        todayDayIndex: 0,
      }
    }

    // 收集所有任务的日期时间戳
    const timestamps: number[] = []
    tasksWithDates.forEach(item => {
      if (item.startDate) timestamps.push(parseDateToTimestamp(item.startDate))
      if (item.endDate) timestamps.push(parseDateToTimestamp(item.endDate))
    })

    const dataMinTs = Math.min(...timestamps)
    const dataMaxTs = Math.max(...timestamps)

    // 图表起点：数据最早日期往前推7天，然后调整到周一
    const chartStartTs = adjustToMonday(dataMinTs - 7 * 24 * 60 * 60 * 1000)
    
    // 图表终点：数据最晚日期往后推14天，然后调整到下一个周一
    let chartEndTs = dataMaxTs + 14 * 24 * 60 * 60 * 1000
    const endDay = getDayOfWeek(chartEndTs)
    const endDiff = endDay === 0 ? 1 : (endDay === 1 ? 7 : 8 - endDay)
    chartEndTs = chartEndTs + endDiff * 24 * 60 * 60 * 1000

    // 总天数
    const totalDays = daysDiff(chartStartTs, chartEndTs)

    // 生成周一标签
    const labels: { ts: number; dayIndex: number; isMonthStart: boolean }[] = []
    let currentTs = chartStartTs
    while (currentTs <= chartEndTs) {
      const dayIndex = daysDiff(chartStartTs, currentTs)
      const dayOfMonth = new Date(currentTs).getDate()
      labels.push({
        ts: currentTs,
        dayIndex,
        isMonthStart: dayOfMonth <= 7,
      })
      currentTs += 7 * 24 * 60 * 60 * 1000 // 下一个周一
    }

    // 今天的位置
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTs = today.getTime()
    const todayDayIndex = daysDiff(chartStartTs, todayTs)

    return {
      chartStartTs,
      chartEndTs,
      totalDays,
      dateLabels: labels,
      todayDayIndex,
    }
  }, [tasksWithDates])

  // 计算任务条位置的函数
  const calculateBarPosition = (startDate: string | null, endDate: string | null): { left: string; width: string } => {
    if (!endDate) return { left: '0%', width: '0%' }

    const { chartStartTs, totalDays } = chartConfig

    // 解析结束日期
    const endTs = parseDateToTimestamp(endDate)
    
    // 解析或估算开始日期
    let startTs: number
    if (startDate) {
      startTs = parseDateToTimestamp(startDate)
    } else {
      // 无开始日期时，假设开始于结束前7天
      startTs = endTs - 7 * 24 * 60 * 60 * 1000
    }

    // 计算相对于图表起点的天数偏移
    const startDayOffset = daysDiff(chartStartTs, startTs)
    const endDayOffset = daysDiff(chartStartTs, endTs)

    // 转换为百分比
    const leftPercent = (startDayOffset / totalDays) * 100
    const widthPercent = ((endDayOffset - startDayOffset) / totalDays) * 100

    return {
      left: `${Math.max(0, leftPercent)}%`,
      width: `${Math.max(0.5, widthPercent)}%`,
    }
  }

  // 按项目分组
  const groupedWithDates = useMemo(() => {
    const groups = new Map<number, { name: string; tasks: GanttItem[]; startDate: string | null; endDate: string | null }>()
    tasksWithDates.forEach(item => {
      const existing = groups.get(item.projectId)
      if (existing) {
        existing.tasks.push(item)
        if (item.startDate && (!existing.startDate || item.startDate < existing.startDate)) {
          existing.startDate = item.startDate
        }
        if (item.endDate && (!existing.endDate || item.endDate > existing.endDate)) {
          existing.endDate = item.endDate
        }
      } else {
        groups.set(item.projectId, {
          name: item.project,
          tasks: [item],
          startDate: item.startDate,
          endDate: item.endDate,
        })
      }
    })
    return Array.from(groups.entries()).map(([id, data]) => ({ id, ...data }))
  }, [tasksWithDates])

  const groupedWithoutDates = useMemo(() => {
    const groups = new Map<number, { name: string; tasks: GanttItem[] }>()
    tasksWithoutDates.forEach(item => {
      const existing = groups.get(item.projectId)
      if (existing) {
        existing.tasks.push(item)
      } else {
        groups.set(item.projectId, { name: item.project, tasks: [item] })
      }
    })
    return Array.from(groups.entries()).map(([id, data]) => ({ id, ...data }))
  }, [tasksWithoutDates])

  // 状态颜色配置
  const statusConfig: Record<string, { gradient: string; text: string; glow: string }> = {
    'Done': { gradient: 'from-emerald-400 to-emerald-600', text: '已完成', glow: 'shadow-emerald-500/30' },
    '完成': { gradient: 'from-emerald-400 to-emerald-600', text: '已完成', glow: 'shadow-emerald-500/30' },
    'In Progress': { gradient: 'from-blue-400 to-blue-600', text: '进行中', glow: 'shadow-blue-500/30' },
    '进行中': { gradient: 'from-blue-400 to-blue-600', text: '进行中', glow: 'shadow-blue-500/30' },
    'Pending': { gradient: 'from-amber-400 to-amber-600', text: '待处理', glow: 'shadow-amber-500/30' },
    '待处理': { gradient: 'from-amber-400 to-amber-600', text: '待处理', glow: 'shadow-amber-500/30' },
    'UAT': { gradient: 'from-purple-400 to-purple-600', text: 'UAT测试', glow: 'shadow-purple-500/30' },
  }

  const getStatusConfig = (status: string) => statusConfig[status] || statusConfig['Pending']

  const { totalDays, dateLabels, todayDayIndex } = chartConfig
  const todayPercent = (todayDayIndex / totalDays) * 100
  const totalTasks = items.length
  const totalProjects = new Set(items.map(i => i.projectId)).size

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border-t border-white/20">
            <Layers className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-slate-900">交付进度总览</h3>
            <p className="text-[11px] text-gray-500">{totalProjects} 个项目 · {totalTasks} 个未完成任务</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <div className="h-2 w-2 rounded-full bg-rose-500" />
            <span>今日</span>
          </div>
          <div className="bg-gray-100/50 p-1 rounded-lg flex text-[12px] font-medium">
            <button 
              onClick={() => setViewMode('gantt')}
              className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'gantt' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              甘特图
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              列表
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'gantt' ? (
        <div className="overflow-x-auto">
          {items.length === 0 ? (
            <div className="py-20 text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-[#34C759]/10 flex items-center justify-center">
                <svg className="h-8 w-8 text-[#34C759]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[#1d1d1f] text-[15px] font-semibold">所有任务已完成</p>
              <p className="text-[#8E8E93] text-[13px] mt-1">暂无未完成的任务</p>
            </div>
          ) : (
            <div className="min-w-[900px]">
              {tasksWithDates.length > 0 && (
                <>
                  {/* 时间轴标签行 - 日期颜色加深 */}
                  <div className="relative h-14 border-b border-gray-100 bg-gray-50/50">
                    <div className="w-[280px] h-full border-r border-gray-100 flex items-center px-6 bg-white">
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">项目 / 任务</span>
                    </div>
                    <div className="absolute top-0 bottom-0 left-[280px] right-0">
                      <div className="relative w-full h-full flex items-end pb-2">
                        {dateLabels.map((label, idx) => {
                          const leftPercent = (label.dayIndex / totalDays) * 100
                          return (
                            <div 
                              key={idx}
                              className="absolute bottom-0 flex flex-col items-center"
                              style={{ left: `${leftPercent}%`, transform: 'translateX(-50%)' }}
                            >
                              {label.isMonthStart && (
                                <span className="text-[11px] font-semibold text-gray-700 mb-0.5">
                                  {getMonthName(label.ts)}
                                </span>
                              )}
                              <span className="text-[10px] text-gray-500 font-mono">
                                {formatDateLabel(label.ts)}
                              </span>
                            </div>
                          )
                        })}
                        {/* 今日指示线（在标签行） */}
                        {todayPercent >= 0 && todayPercent <= 100 && (
                          <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-rose-500 to-pink-500 z-20"
                            style={{ left: `${todayPercent}%` }}
                          >
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-rose-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 项目和任务行 */}
                  {groupedWithDates.map((project) => {
                    const isCollapsed = collapsedProjects.has(project.id)
                    const projectBarStyle = calculateBarPosition(project.startDate, project.endDate)
                    
                    return (
                      <div key={project.id} className="border-b border-[#F5F5F7] last:border-0">
                        {/* 项目行 */}
                        <div 
                          className="relative h-14 bg-gradient-to-r from-[#F8F8FA] to-[#F5F5F7] hover:from-[#F0F0F5] hover:to-[#EBEBF0] cursor-pointer group"
                          onClick={() => toggleProject(project.id)}
                        >
                          <div className="w-[280px] h-full border-r border-[#E5E5EA] flex items-center px-6 absolute left-0 top-0 z-10 bg-gradient-to-r from-[#F8F8FA] to-transparent group-hover:from-[#F0F0F5]">
                            <button className="mr-2 p-1 rounded-md hover:bg-white/50">
                              {isCollapsed ? <ChevronRight className="h-4 w-4 text-[#636366]" /> : <ChevronDown className="h-4 w-4 text-[#636366]" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <span className="text-[13px] font-bold text-[#1d1d1f] truncate block">{project.name}</span>
                              <span className="text-[10px] text-[#8E8E93]">{project.tasks.length} 个任务</span>
                            </div>
                          </div>
                          <div className="absolute top-0 bottom-0 left-[280px] right-0 flex items-center px-3">
                            <div className="relative w-full h-8">
                              {/* 网格线 */}
                              {dateLabels.map((label, idx) => (
                                <div key={idx} className="absolute top-0 bottom-0 w-[1px] bg-[#E5E5EA]/50" style={{ left: `${(label.dayIndex / totalDays) * 100}%` }} />
                              ))}
                              {/* 今日线 */}
                              {todayPercent >= 0 && todayPercent <= 100 && (
                                <div className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-rose-500/50 to-pink-500/50 z-10" style={{ left: `${todayPercent}%` }} />
                              )}
                              {/* 项目条 */}
                              <div className="absolute h-2 rounded-full bg-gradient-to-r from-[#C7C7CC] to-[#AEAEB2] top-1/2 -translate-y-1/2 opacity-60" style={projectBarStyle} />
                            </div>
                          </div>
                        </div>
                        
                        {/* 任务行 */}
                        {!isCollapsed && project.tasks.map((task, taskIdx) => {
                          const barStyle = calculateBarPosition(task.startDate, task.endDate)
                          const config = getStatusConfig(task.status)
                          
                          return (
                            <div key={task.id} className={`relative h-12 hover:bg-[#F5F5F7]/50 group ${taskIdx < project.tasks.length - 1 ? 'border-b border-[#F5F5F7]/50' : ''}`}>
                              <div className="w-[280px] h-full border-r border-[#E5E5EA] flex items-center pl-14 pr-4 absolute left-0 top-0 bg-white group-hover:bg-[#F5F5F7]/50 z-10">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span className="text-[12px] text-[#636366] truncate flex-1" title={task.name}>{task.name}</span>
                                </div>
                              </div>
                              <div className="absolute top-0 bottom-0 left-[280px] right-0 flex items-center px-3">
                                <div className="relative w-full h-7">
                                  {/* 网格线 */}
                                  {dateLabels.map((label, idx) => (
                                    <div key={idx} className="absolute top-0 bottom-0 w-[1px] bg-[#F5F5F7]" style={{ left: `${(label.dayIndex / totalDays) * 100}%` }} />
                                  ))}
                                  {/* 今日线 */}
                                  {todayPercent >= 0 && todayPercent <= 100 && (
                                    <div className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-rose-500/30 to-pink-500/30" style={{ left: `${todayPercent}%` }} />
                                  )}
                                  {/* 任务条 */}
                                  <div 
                                    className={`absolute h-7 rounded-lg bg-gradient-to-r ${config.gradient} shadow-md ${config.glow} cursor-pointer hover:scale-y-110 hover:shadow-lg transition-all flex items-center justify-center overflow-hidden`}
                                    style={barStyle}
                                    title={`${task.name}\n${task.startDate || '未设置'} → ${task.endDate}\n状态: ${config.text}`}
                                  >
                                    <span className="text-white text-[10px] font-semibold px-2 truncate drop-shadow-sm">{task.name}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </>
              )}

              {/* 无截止日期的任务 - 红系次级，纯白底 + 红边框，标题灰色 */}
              {tasksWithoutDates.length > 0 && (
                <div className="border-t border-red-100 bg-white">
                  <div className="px-6 py-2.5 flex items-center gap-2 border-b border-red-100">
                    <span className="text-[12px] font-semibold text-gray-600">无截止日期的任务 ({tasksWithoutDates.length})</span>
                  </div>
                  {groupedWithoutDates.map((project) => (
                    <div key={project.id} className="border-b border-gray-100 last:border-0">
                      <div className="px-6 py-2 bg-gray-50/50">
                        <span className="text-[12px] font-semibold text-gray-600">{project.name}</span>
                      </div>
                      {project.tasks.map((task) => {
                        const config = getStatusConfig(task.status)
                        return (
                          <div key={task.id} className="px-6 py-2.5 flex items-center gap-4 hover:bg-gray-50/50 border-b border-gray-100/80 last:border-0">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-[13px] text-gray-600">{task.name}</span>
                            </div>
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold bg-gradient-to-r ${config.gradient} text-white`}>{config.text}</span>
                            <span className="text-[11px] text-gray-500 px-2 py-0.5 rounded-md border border-gray-200">无截止日期</span>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}

              {/* 图例 */}
              <div className="px-8 py-5 border-t border-[#F5F5F7] bg-[#FAFAFA]/50 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <span className="text-[11px] text-[#8E8E93] font-semibold uppercase">状态图例</span>
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-md bg-gradient-to-r from-amber-400 to-amber-600" />
                      <span className="text-[11px] text-[#636366]">待处理</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-md bg-gradient-to-r from-blue-400 to-blue-600" />
                      <span className="text-[11px] text-[#636366]">进行中</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-md bg-gradient-to-r from-purple-400 to-purple-600" />
                      <span className="text-[11px] text-[#636366]">UAT测试</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-[#8E8E93]">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-0.5 bg-gradient-to-b from-rose-500 to-pink-500 rounded-full" />
                    <span>今日标记</span>
                  </div>
                  <span>|</span>
                  <span>点击项目行可折叠/展开</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 列表视图 */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-[11px] font-bold text-[#86868b] uppercase bg-[#FAFAFA] border-b border-[#F5F5F7]">
              <tr>
                <th className="px-8 py-4">项目</th>
                <th className="px-6 py-4">任务</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4">开始</th>
                <th className="px-6 py-4">截止</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {items.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center text-[#8E8E93]">所有任务已完成</td></tr>
              ) : (
                [...groupedWithDates, ...groupedWithoutDates].map((project) => (
                  project.tasks.map((task, idx) => {
                    const config = getStatusConfig(task.status)
                    return (
                      <tr key={task.id} className="hover:bg-[#F5F5F7]/50 border-b border-[#F5F5F7]">
                        <td className="px-8 py-4">{idx === 0 ? <span className="font-semibold text-[#1d1d1f]">{project.name}</span> : ''}</td>
                        <td className="px-6 py-4 text-[#636366]">{task.name}</td>
                        <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gradient-to-r ${config.gradient} text-white`}>{config.text}</span></td>
                        <td className="px-6 py-4 text-[#8E8E93] font-mono text-[12px]">{task.startDate || '-'}</td>
                        <td className="px-6 py-4 font-mono text-[12px]">{task.endDate ? <span className="text-[#8E8E93]">{task.endDate}</span> : <span className="text-[#FF9500]">无截止日期</span>}</td>
                      </tr>
                    )
                  })
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
