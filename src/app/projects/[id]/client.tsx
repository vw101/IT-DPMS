"use client"

import React, { useState, useMemo, useRef, useEffect } from "react"
import { Badge, BadgeStatus } from "@/components/ui/Badge"
import { Target, Plus, Edit, ChevronRight, ChevronDown, Trash2, History, Search, X, Ellipsis } from "lucide-react"
import { TaskTreeNode } from "./page"
import { Tooltip } from "@/components/ui/Tooltip"
import { CreateTaskModal } from "@/components/modals/CreateTaskModal"
import { CreateSubTaskModal } from "@/components/modals/CreateSubTaskModal"
import { EditTaskModal } from "@/components/modals/EditTaskModal"
import { EditSubTaskModal } from "@/components/modals/EditSubTaskModal"
import { DeleteProjectModal } from "@/components/modals/DeleteProjectModal"
import { DeleteTaskModal } from "@/components/modals/DeleteTaskModal"
import { TaskHistoryModal } from "@/components/modals/TaskHistoryModal"
import { TaskDetailSidebar } from "@/components/TaskDetailSidebar"

interface User {
  id: number
  name: string
}

interface ProjectDetailClientProps {
  project: {
    id: number
    name: string
  }
  taskTree: TaskTreeNode[]
  users: User[]
}

export function ProjectDetailClient({ project, taskTree, users }: ProjectDetailClientProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {}
    taskTree.forEach(task => {
      if (task.children.length > 0) {
        initial[task.id] = true
      }
    })
    return initial
  })

  // 搜索状态
  const [searchText, setSearchText] = useState("")
  const [searchOwner, setSearchOwner] = useState("")

  // Modal states
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false)
  const [isCreateSubTaskModalOpen, setIsCreateSubTaskModalOpen] = useState(false)
  const [isEditSubTaskModalOpen, setIsEditSubTaskModalOpen] = useState(false)
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false)
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false)
  const [isTaskHistoryModalOpen, setIsTaskHistoryModalOpen] = useState(false)
  
  // 当前选中的父任务（用于创建子任务）
  const [selectedParentTask, setSelectedParentTask] = useState<{ id: number; name: string } | null>(null)
  
  // 当前编辑的任务
  const [editingTask, setEditingTask] = useState<TaskTreeNode | null>(null)
  
  // 当前编辑的子任务
  const [editingSubTask, setEditingSubTask] = useState<{
    parentName: string
    subTask: TaskTreeNode
  } | null>(null)

  // 当前删除的任务
  const [deletingTask, setDeletingTask] = useState<{ id: number; name: string; isSubTask: boolean } | null>(null)

  // 当前查看历史的任务
  const [historyTask, setHistoryTask] = useState<{ id: number; name: string } | null>(null)

  // 侧边栏详情：当前选中的任务（用于 Inspector 面板）
  const [detailTask, setDetailTask] = useState<{ task: TaskTreeNode; parentName?: string } | null>(null)

  // 操作列下拉菜单（当前打开的任务 id）
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null)
  const actionMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openActionMenuId != null && actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setOpenActionMenuId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [openActionMenuId])

  // 过滤后的任务树
  const filteredTaskTree = useMemo(() => {
    if (!searchText && !searchOwner) return taskTree

    return taskTree.filter(task => {
      // 检查主任务是否匹配
      const taskNameMatch = searchText ? task.name.toLowerCase().includes(searchText.toLowerCase()) : true
      const taskOwnerMatch = searchOwner ? task.owners.some(o => o.name === searchOwner) : true

      // 检查子任务是否有匹配的
      const hasMatchingChild = task.children.some(child => {
        const childNameMatch = searchText ? child.name.toLowerCase().includes(searchText.toLowerCase()) : true
        const childOwnerMatch = searchOwner ? child.owners.some(o => o.name === searchOwner) : true
        return childNameMatch && childOwnerMatch
      })

      // 主任务匹配或有子任务匹配都返回
      return (taskNameMatch && taskOwnerMatch) || hasMatchingChild
    }).map(task => {
      // 如果有搜索条件，过滤子任务
      if (searchText || searchOwner) {
        const filteredChildren = task.children.filter(child => {
          const childNameMatch = searchText ? child.name.toLowerCase().includes(searchText.toLowerCase()) : true
          const childOwnerMatch = searchOwner ? child.owners.some(o => o.name === searchOwner) : true
          return childNameMatch && childOwnerMatch
        })
        return { ...task, children: filteredChildren }
      }
      return task
    })
  }, [taskTree, searchText, searchOwner])

  // 获取所有负责人列表（去重）
  const allOwners = useMemo(() => {
    const ownerSet = new Set<string>()
    taskTree.forEach(task => {
      task.owners.forEach(o => ownerSet.add(o.name))
      task.children.forEach(child => {
        child.owners.forEach(o => ownerSet.add(o.name))
      })
    })
    return Array.from(ownerSet).sort()
  }, [taskTree])

  const toggleExpand = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleAddSubTask = (parentTask: { id: number; name: string }) => {
    setSelectedParentTask(parentTask)
    setIsCreateSubTaskModalOpen(true)
  }

  const handleEditTask = (task: TaskTreeNode) => {
    setEditingTask(task)
    setIsEditTaskModalOpen(true)
  }

  const handleEditSubTask = (parentName: string, subTask: TaskTreeNode) => {
    setEditingSubTask({ parentName, subTask })
    setIsEditSubTaskModalOpen(true)
  }

  const handleDeleteTask = (task: { id: number; name: string }, isSubTask: boolean) => {
    setDeletingTask({ ...task, isSubTask })
    setIsDeleteTaskModalOpen(true)
  }

  const handleViewHistory = (task: { id: number; name: string }) => {
    setHistoryTask(task)
    setIsTaskHistoryModalOpen(true)
  }

  const openDetail = (task: TaskTreeNode, parentName?: string) => {
    setDetailTask({ task, parentName })
  }

  /** 行点击：若用户正在选中文本（复制）则不打开抽屉；否则打开详情侧边栏 */
  const handleRowClick = (e: React.MouseEvent<HTMLDivElement>, task: TaskTreeNode, parentName?: string) => {
    const selection = window.getSelection()
    if (selection && selection.toString().length > 0) return
    openDetail(task, parentName)
  }

  const clearSearch = () => {
    setSearchText("")
    setSearchOwner("")
  }

  // 格式化日期：空时返回占位符（用于后续用 Em Dash 展示）
  const formatDate = (date: string | null) => {
    if (!date || date === '待定') return null
    return date
  }

  // 渲染日期列：空时显示浅灰 Em Dash，保持静谧感
  const renderDate = (date: string | null) => {
    const value = formatDate(date)
    if (value == null) return <span className="text-gray-300">—</span>
    return <span className="text-[13px] text-[#636366]">{value}</span>
  }

  // 渲染任务名称：主任务最多 26 字符，子任务 30 字符，超出用 ... 截断，不换行，hover 显示完整
  const renderTaskName = (name: string, isParent: boolean) => {
    const maxLen = isParent ? 26 : 30
    const truncated = name.length > maxLen
    const display = truncated ? name.slice(0, maxLen) + '...' : name
    const baseClass = isParent 
      ? 'text-[14px] font-semibold text-[#1d1d1f] whitespace-nowrap' 
      : 'text-[13px] text-[#636366] whitespace-nowrap'
    if (truncated) {
      return (
        <Tooltip content={name}>
          <span className={`${baseClass} cursor-default`}>
            {display}
          </span>
        </Tooltip>
      )
    }
    return <span className={baseClass}>{name}</span>
  }

  // Facepile：多负责人头像堆叠（重叠 + 白边），悬停 Tooltip 显示全名
  const renderOwners = (owners: { id: number; name: string }[]) => {
    if (owners.length === 0) {
      return <span className="text-gray-300">—</span>
    }
    const names = owners.map(o => o.name).join('、')
    const visible = owners.slice(0, 3)
    const extra = owners.length - 3
    return (
      <Tooltip content={names}>
        <div className="flex items-center -space-x-1.5 cursor-default">
          {visible.map((owner, idx) => (
            <div
              key={owner.id}
              className="h-7 w-7 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 flex items-center justify-center text-[11px] font-semibold ring-2 ring-white flex-shrink-0"
              style={{ zIndex: 10 - idx }}
            >
              {owner.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {extra > 0 && (
            <div
              className="h-7 w-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-medium ring-2 ring-white flex-shrink-0"
              style={{ zIndex: 0 }}
            >
              +{extra}
            </div>
          )}
        </div>
      </Tooltip>
    )
  }

  return (
    <>
      <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-white hover:border-[#007AFF]/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
        {/* Header Section */}
        <div className="p-6 border-b border-[#F5F5F7] flex justify-between items-center bg-[#FAFAFA]/50 rounded-t-[20px]">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">
                {project.name}
              </h2>
              <p className="text-[13px] text-[#636366] mt-0.5">WBS 任务分解结构</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsDeleteProjectModalOpen(true)}
              className="text-[#FF3B30] bg-[#FF3B30]/10 px-4 py-2.5 rounded-full font-medium text-[13px] hover:bg-[#FF3B30]/20 active:scale-95 transition-all duration-200 flex items-center gap-1.5"
            >
              <Trash2 className="h-4 w-4" /> 删除项目
            </button>
            <button 
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="bg-gradient-to-b from-[#007AFF] to-[#0062CC] text-white px-5 py-2.5 rounded-full font-medium text-[13px] shadow-sm hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all duration-200 flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> 添加任务项
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="px-8 py-4 border-b border-[#F5F5F7] bg-[#FAFAFA]/30">
          <div className="flex items-center gap-4">
            {/* 任务名称搜索 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8E93]" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="搜索任务名称..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E5EA] rounded-[10px] text-[13px] text-[#1d1d1f] placeholder-[#8E8E93] focus:border-[#007AFF]/50 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] outline-none transition-all"
              />
            </div>
            
            {/* 负责人筛选 */}
            <div className="w-48">
              <select
                value={searchOwner}
                onChange={(e) => setSearchOwner(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#E5E5EA] rounded-[10px] text-[13px] text-[#1d1d1f] focus:border-[#007AFF]/50 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">全部负责人</option>
                {allOwners.map(owner => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
            </div>

            {/* 清除搜索 */}
            {(searchText || searchOwner) && (
              <button
                onClick={clearSearch}
                className="flex items-center gap-1.5 px-3 py-2 text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-lg transition-colors text-[13px]"
              >
                <X className="h-4 w-4" /> 清除
              </button>
            )}
          </div>
          
          {/* 搜索结果提示 */}
          {(searchText || searchOwner) && (
            <p className="mt-2 text-[12px] text-[#8E8E93]">
              找到 {filteredTaskTree.length} 个匹配的任务
              {searchText && <span>，名称包含 "{searchText}"</span>}
              {searchOwner && <span>，负责人为 {searchOwner}</span>}
            </p>
          )}
        </div>

        {/* Table Section - 仅展示索引信息：任务名称 | 状态 | 负责人 | 开始/截止 | 操作 */}
        <div className="w-full">
          <div className="grid grid-cols-12 gap-3 px-6 py-3 h-12 items-center bg-[#FAFAFA] border-b border-[#F5F5F7] text-[11px] font-bold text-[#86868b] uppercase tracking-wider">
            <div className="col-span-4 min-w-[200px]">任务名称</div>
            <div className="col-span-1 min-w-[88px]">状态</div>
            <div className="col-span-2 min-w-[96px]">负责人</div>
            <div className="col-span-2 min-w-[108px]">开始</div>
            <div className="col-span-2 min-w-[108px]">截止</div>
            <div className="col-span-1 text-right">操作</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-[#F5F5F7]">
            {filteredTaskTree.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 bg-[#F5F5F7] rounded-full flex items-center justify-center mb-3">
                  <Target className="h-6 w-6 text-[#8E8E93]" />
                </div>
                <p className="text-[14px] text-[#8E8E93]">
                  {searchText || searchOwner ? '没有找到匹配的任务' : '暂无任务，点击上方按钮添加'}
                </p>
              </div>
            ) : (
              filteredTaskTree.map((item) => (
                <div key={item.id}>
                  {/* Parent Row - 固定 h-12，可点击行打开详情 */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleRowClick(e, item)}
                    onKeyDown={(e) => e.key === "Enter" && openDetail(item)}
                    className={`grid grid-cols-12 gap-3 px-6 h-12 items-center hover:bg-gray-50 transition-colors group cursor-pointer ${expanded[item.id] ? 'bg-[#F5F5F7]/40' : ''}`}
                  >
                    <div className="col-span-4 flex items-center gap-2 min-w-[200px] overflow-hidden">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleExpand(item.id)
                        }}
                        className={`w-8 h-8 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer flex-shrink-0 relative z-10 ${item.children.length === 0 ? 'invisible pointer-events-none' : ''}`}
                        title={expanded[item.id] ? '收起' : '展开'}
                        aria-label={expanded[item.id] ? '收起子任务' : '展开子任务'}
                      >
                        {expanded[item.id] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {renderTaskName(item.name, true)}
                      <button
                        type="button"
                        className="flex-shrink-0 p-1 rounded text-gray-400 hover:text-[#007AFF] hover:bg-[#007AFF]/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="添加子任务"
                        onClick={(e) => { e.stopPropagation(); handleAddSubTask({ id: item.id, name: item.name }) }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="col-span-1 min-w-[88px]">
                      <Badge status={item.status as BadgeStatus} />
                    </div>
                    <div className="col-span-2 min-w-[96px]">
                      {renderOwners(item.owners)}
                    </div>
                    <div className="col-span-2 min-w-[108px] text-[13px] text-gray-500">{renderDate(item.startDate)}</div>
                    <div className="col-span-2 min-w-[108px] text-[13px] text-gray-500">{renderDate(item.dueDate)}</div>
                    <div
                      className="col-span-1 flex justify-end items-center relative"
                      ref={openActionMenuId === item.id ? actionMenuRef : undefined}
                      onClick={(e) => e.stopPropagation()}
                      role="presentation"
                    >
                      <button
                        type="button"
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        title="更多"
                        aria-label="更多"
                        onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(openActionMenuId === item.id ? null : item.id) }}
                      >
                        <Ellipsis className="h-4 w-4" />
                      </button>
                      {openActionMenuId === item.id && (
                        <div className="absolute right-0 top-full mt-1 py-1 min-w-[120px] bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                          <button
                            type="button"
                            className="w-full px-3 py-2 text-left text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditTask(item)
                              setOpenActionMenuId(null)
                            }}
                          >
                            <Edit className="h-3.5 w-3.5" /> 编辑
                          </button>
                          <button
                            type="button"
                            className="w-full px-3 py-2 text-left text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddSubTask({ id: item.id, name: item.name })
                              setOpenActionMenuId(null)
                            }}
                          >
                            <Plus className="h-3.5 w-3.5" /> 添加子任务
                          </button>
                          <button
                            type="button"
                            className="w-full px-3 py-2 text-left text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteTask({ id: item.id, name: item.name }, false)
                              setOpenActionMenuId(null)
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> 删除
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Child Rows - 固定 h-12，L 型连接线，可点击打开详情 */}
                  {expanded[item.id] && item.children.map(sub => (
                    <div
                      key={sub.id}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => handleRowClick(e, sub, item.name)}
                      onKeyDown={(e) => e.key === "Enter" && openDetail(sub, item.name)}
                      className="grid grid-cols-12 gap-3 px-6 h-12 items-center bg-white relative group hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="col-span-4 flex items-center pl-10 relative min-w-[200px] overflow-hidden">
                        <div className="absolute left-[34px] top-[-16px] bottom-[50%] w-px bg-gray-300 rounded-b-md" aria-hidden></div>
                        <div className="absolute left-[34px] top-[50%] w-2.5 h-px bg-gray-300 rounded-bl-md" aria-hidden></div>
                        {renderTaskName(sub.name, false)}
                      </div>
                      <div className="col-span-1 min-w-[88px]">
                        <Badge status={sub.status as BadgeStatus} />
                      </div>
                      <div className="col-span-2 min-w-[96px]">
                        {renderOwners(sub.owners)}
                      </div>
                      <div className="col-span-2 min-w-[108px] text-[13px] text-gray-500">{renderDate(sub.startDate)}</div>
                      <div className="col-span-2 min-w-[108px] text-[13px] text-gray-500">{renderDate(sub.dueDate)}</div>
                      <div
                        className="col-span-1 flex justify-end items-center relative"
                        ref={openActionMenuId === sub.id ? actionMenuRef : undefined}
                        onClick={(e) => e.stopPropagation()}
                        role="presentation"
                      >
                        <button
                          type="button"
                          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          title="更多"
                          aria-label="更多"
                          onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(openActionMenuId === sub.id ? null : sub.id) }}
                        >
                          <Ellipsis className="h-4 w-4" />
                        </button>
                        {openActionMenuId === sub.id && (
                          <div className="absolute right-0 top-full mt-1 py-1 min-w-[120px] bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                            <button
                              type="button"
                              className="w-full px-3 py-2 text-left text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditSubTask(item.name, sub)
                                setOpenActionMenuId(null)
                              }}
                            >
                              <Edit className="h-3.5 w-3.5" /> 编辑
                            </button>
                            <button
                              type="button"
                              className="w-full px-3 py-2 text-left text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteTask({ id: sub.id, name: sub.name }, true)
                                setOpenActionMenuId(null)
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" /> 删除
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        projectId={project.id}
        projectName={project.name}
      />

      {editingTask && (
        <EditTaskModal
          isOpen={isEditTaskModalOpen}
          onClose={() => {
            setIsEditTaskModalOpen(false)
            setEditingTask(null)
          }}
          projectName={project.name}
          task={{
            id: editingTask.id,
            name: editingTask.name,
            description: editingTask.description ?? undefined,
            status: editingTask.status,
            priority: editingTask.priority,
            devManDays: editingTask.devManDays,
            testManDays: editingTask.testManDays,
          }}
        />
      )}

      {selectedParentTask && (
        <CreateSubTaskModal
          isOpen={isCreateSubTaskModalOpen}
          onClose={() => {
            setIsCreateSubTaskModalOpen(false)
            setSelectedParentTask(null)
          }}
          projectId={project.id}
          parentTask={selectedParentTask}
          users={users}
        />
      )}

      {editingSubTask && (
        <EditSubTaskModal
          isOpen={isEditSubTaskModalOpen}
          onClose={() => {
            setIsEditSubTaskModalOpen(false)
            setEditingSubTask(null)
          }}
          parentTaskName={editingSubTask.parentName}
          subTask={{
            id: editingSubTask.subTask.id,
            name: editingSubTask.subTask.name,
            status: editingSubTask.subTask.status,
            startDate: editingSubTask.subTask.startDate,
            dueDate: editingSubTask.subTask.dueDate === '待定' ? null : editingSubTask.subTask.dueDate,
            ownerIds: editingSubTask.subTask.ownerIds,
            owners: editingSubTask.subTask.owners,
            devManDays: editingSubTask.subTask.devManDays,
            testManDays: editingSubTask.subTask.testManDays,
          }}
          users={users}
        />
      )}

      <DeleteProjectModal
        isOpen={isDeleteProjectModalOpen}
        onClose={() => setIsDeleteProjectModalOpen(false)}
        project={project}
      />

      {deletingTask && (
        <DeleteTaskModal
          isOpen={isDeleteTaskModalOpen}
          onClose={() => {
            setIsDeleteTaskModalOpen(false)
            setDeletingTask(null)
          }}
          task={deletingTask}
          projectId={project.id}
        />
      )}

      {historyTask && (
        <TaskHistoryModal
          isOpen={isTaskHistoryModalOpen}
          onClose={() => {
            setIsTaskHistoryModalOpen(false)
            setHistoryTask(null)
          }}
          task={historyTask}
        />
      )}

      <TaskDetailSidebar
        isOpen={!!detailTask}
        onClose={() => setDetailTask(null)}
        task={detailTask?.task ?? null}
        parentName={detailTask?.parentName}
        onEdit={detailTask ? () => {
          if (detailTask.parentName) {
            handleEditSubTask(detailTask.parentName, detailTask.task)
          } else {
            handleEditTask(detailTask.task)
          }
          setDetailTask(null)
        } : undefined}
        onViewHistory={detailTask ? () => {
          handleViewHistory({ id: detailTask.task.id, name: detailTask.task.name })
          setDetailTask(null)
        } : undefined}
      />
    </>
  )
}
