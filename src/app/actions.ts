'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// 获取所有用户（用于选择成员）
export async function getUsers() {
  return await prisma.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      title: true,
    },
    orderBy: { name: 'asc' },
  })
}

// 创建新项目
export async function createProject(data: {
  name: string
  description?: string
  projectType?: string // 'Change Requirement' | 'Support'
  budget?: number
  currency?: string
  pmId: number
  memberIds?: number[]
}) {
  if (!data.name || !data.pmId) {
    throw new Error('项目名称和项目经理是必填项')
  }
  const projectType = data.projectType === 'Support' ? 'Support' : 'Change Requirement'

  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description || null,
      projectType,
      budget: data.budget || 0,
      currency: data.currency || 'USD',
      pmId: data.pmId,
      status: 'Pending',
      progress: 0,
    },
  })

  // 添加项目成员
  if (data.memberIds && data.memberIds.length > 0) {
    await prisma.projectMember.createMany({
      data: data.memberIds.map((userId) => ({
        projectId: project.id,
        userId,
        role: userId === data.pmId ? 'Manager' : 'Member',
      })),
      skipDuplicates: true,
    })
  }

  revalidatePath('/projects')
  revalidatePath('/')
  
  return { id: project.id, name: project.name }
}

// 更新项目
export async function updateProject(data: {
  id: number
  name?: string
  description?: string
  projectType?: string // 'Change Requirement' | 'Support'
  memberIds?: number[]
}) {
  if (!data.id) {
    throw new Error('项目ID是必填项')
  }

  const projectType = data.projectType !== undefined
    ? (data.projectType === 'Support' ? 'Support' : 'Change Requirement')
    : undefined

  const project = await prisma.project.update({
    where: { id: data.id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(projectType !== undefined && { projectType }),
    },
  })

  // 更新项目成员
  if (data.memberIds !== undefined) {
    // 先删除现有成员
    await prisma.projectMember.deleteMany({
      where: { projectId: data.id },
    })
    
    // 重新添加成员
    if (data.memberIds.length > 0) {
      await prisma.projectMember.createMany({
        data: data.memberIds.map((userId, index) => ({
          projectId: data.id,
          userId,
          role: index === 0 ? 'Manager' : 'Member',
        })),
        skipDuplicates: true,
      })
    }
  }

  revalidatePath('/projects')
  revalidatePath(`/projects/${data.id}`)
  revalidatePath('/')
  
  return { id: project.id, name: project.name }
}

const DESCRIPTION_MAX_LENGTH = 500

// 创建父任务
export async function createParentTask(data: {
  name: string
  projectId: number
  description?: string
  remark?: string
  status?: string
  priority?: string
  dueDate?: string
  ownerId?: number
  devManDays?: number
  testManDays?: number
}) {
  if (!data.name || !data.projectId) {
    throw new Error('任务名称是必填项')
  }
  const desc = data.description?.trim() ?? ''
  if (desc.length > DESCRIPTION_MAX_LENGTH) {
    throw new Error(`任务描述不能超过 ${DESCRIPTION_MAX_LENGTH} 字符`)
  }

  const lastTask = await prisma.task.findFirst({
    where: {
      projectId: data.projectId,
      parentId: null,
    },
    orderBy: { order: 'desc' },
  })

  const task = await prisma.task.create({
    data: {
      name: data.name,
      description: desc || null,
      remark: data.remark?.trim() || null,
      status: data.status || 'Pending',
      priority: data.priority || 'Medium',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      projectId: data.projectId,
      ownerId: data.ownerId || null,
      order: lastTask ? lastTask.order + 1 : 0,
      devManDays: data.devManDays ?? 0,
      testManDays: data.testManDays ?? 0,
    },
  })

  // 记录操作历史
  await prisma.activityLog.create({
    data: {
      action: 'CREATE_TASK',
      details: JSON.stringify({ taskId: task.id, taskName: task.name, type: 'parent' }),
      userId: 1, // TODO: 从会话获取当前用户
      projectId: data.projectId,
    },
  })

  // 更新项目进度
  await updateProjectProgress(data.projectId)
  
  revalidatePath(`/projects/${data.projectId}`)
  revalidatePath('/')
  
  return { id: task.id, name: task.name }
}

// 更新父任务
export async function updateParentTask(data: {
  id: number
  name?: string
  description?: string
  remark?: string
  status?: string
  priority?: string
  devManDays?: number
  testManDays?: number
}) {
  if (!data.id) {
    throw new Error('任务ID是必填项')
  }
  if (data.description !== undefined) {
    const desc = data.description?.trim() ?? ''
    if (desc.length > DESCRIPTION_MAX_LENGTH) {
      throw new Error(`任务描述不能超过 ${DESCRIPTION_MAX_LENGTH} 字符`)
    }
  }

  const oldTask = await prisma.task.findUnique({ where: { id: data.id } })

  const task = await prisma.task.update({
    where: { id: data.id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description?.trim() || null }),
      ...(data.remark !== undefined && { remark: data.remark?.trim() || null }),
      ...(data.status && { status: data.status }),
      ...(data.priority && { priority: data.priority }),
      ...(data.devManDays !== undefined && { devManDays: data.devManDays }),
      ...(data.testManDays !== undefined && { testManDays: data.testManDays }),
    },
  })

  // 记录操作历史
  await prisma.activityLog.create({
    data: {
      action: 'UPDATE_TASK',
      details: JSON.stringify({ 
        taskId: task.id, 
        taskName: task.name, 
        type: 'parent',
        changes: {
          name: data.name !== oldTask?.name ? { old: oldTask?.name, new: data.name } : undefined,
          status: data.status !== oldTask?.status ? { old: oldTask?.status, new: data.status } : undefined,
          description: data.description !== undefined && data.description?.trim() !== (oldTask?.description ?? '') ? { updated: true } : undefined,
        }
      }),
      userId: 1,
      projectId: task.projectId,
    },
  })

  // 更新项目进度
  await updateProjectProgress(task.projectId)
  
  revalidatePath(`/projects/${task.projectId}`)
  revalidatePath('/')
  
  return { id: task.id, name: task.name }
}

// 创建子任务（支持多负责人）
export async function createSubTask(data: {
  name: string
  projectId: number
  parentId: number
  status?: string
  priority?: string
  startDate?: string
  dueDate?: string
  ownerIds?: number[]
  notes?: string
  remark?: string
  devManDays?: number
  testManDays?: number
}) {
  if (!data.name || !data.projectId || !data.parentId) {
    throw new Error('任务名称是必填项')
  }

  const lastTask = await prisma.task.findFirst({
    where: {
      projectId: data.projectId,
      parentId: data.parentId,
    },
    orderBy: { order: 'desc' },
  })

  const parentTask = await prisma.task.findUnique({ where: { id: data.parentId } })

  // 创建任务
  const task = await prisma.task.create({
    data: {
      name: data.name,
      status: data.status || 'Pending',
      priority: data.priority || 'Medium',
      startDate: data.startDate ? new Date(data.startDate) : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      projectId: data.projectId,
      parentId: data.parentId,
      ownerId: data.ownerIds && data.ownerIds.length > 0 ? data.ownerIds[0] : null,
      order: lastTask ? lastTask.order + 1 : 0,
      remark: data.remark?.trim() || null,
      devManDays: data.devManDays ?? 0,
      testManDays: data.testManDays ?? 0,
    },
  })

  // 创建多负责人关联
  if (data.ownerIds && data.ownerIds.length > 0) {
    await prisma.taskOwner.createMany({
      data: data.ownerIds.map(userId => ({
        taskId: task.id,
        userId,
      })),
      skipDuplicates: true,
    })
  }

  // 记录操作历史
  await prisma.activityLog.create({
    data: {
      action: 'CREATE_SUBTASK',
      details: JSON.stringify({ 
        taskId: task.id, 
        taskName: task.name, 
        parentId: data.parentId,
        parentName: parentTask?.name,
        ownerIds: data.ownerIds,
        type: 'subtask' 
      }),
      userId: 1,
      projectId: data.projectId,
    },
  })

  // 更新项目进度
  await updateProjectProgress(data.projectId)
  
  revalidatePath(`/projects/${data.projectId}`)
  revalidatePath('/')
  
  return { id: task.id, name: task.name }
}

// 更新子任务（支持多负责人）
export async function updateSubTask(data: {
  id: number
  name: string
  status: string
  startDate: string | null
  dueDate: string | null
  ownerIds: number[]
  notes?: string
  remark?: string
  devManDays?: number
  testManDays?: number
}) {
  if (!data.id) {
    throw new Error('任务ID是必填项')
  }

  const oldTask = await prisma.task.findUnique({ 
    where: { id: data.id },
    include: { 
      owner: true,
      owners: { include: { user: true } }
    }
  })

  if (!oldTask) {
    throw new Error('任务不存在')
  }

  // 更新任务基本信息
  const task = await prisma.task.update({
    where: { id: data.id },
    data: {
      name: data.name,
      status: data.status,
      startDate: data.startDate ? new Date(data.startDate) : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      ownerId: data.ownerIds.length > 0 ? data.ownerIds[0] : null,
      ...(data.remark !== undefined && { remark: data.remark?.trim() || null }),
      ...(data.devManDays !== undefined && { devManDays: data.devManDays }),
      ...(data.testManDays !== undefined && { testManDays: data.testManDays }),
    },
  })

  // 删除旧的负责人关联
  await prisma.taskOwner.deleteMany({
    where: { taskId: data.id }
  })

  // 创建新的负责人关联
  if (data.ownerIds.length > 0) {
    await prisma.taskOwner.createMany({
      data: data.ownerIds.map(userId => ({
        taskId: task.id,
        userId,
      })),
      skipDuplicates: true,
    })
  }

  // 获取更新后的负责人信息
  const updatedOwners = await prisma.taskOwner.findMany({
    where: { taskId: task.id },
    include: { user: true }
  })

  const oldOwnerNames = oldTask.owners.map(o => o.user.name).join(', ')
  const newOwnerNames = updatedOwners.map(o => o.user.name).join(', ')

  // 记录操作历史
  await prisma.activityLog.create({
    data: {
      action: 'UPDATE_SUBTASK',
      details: JSON.stringify({ 
        taskId: task.id, 
        taskName: task.name, 
        type: 'subtask',
        changes: {
          name: data.name !== oldTask.name ? { old: oldTask.name, new: data.name } : undefined,
          status: data.status !== oldTask.status ? { old: oldTask.status, new: data.status } : undefined,
          owners: oldOwnerNames !== newOwnerNames ? { old: oldOwnerNames || '无', new: newOwnerNames || '无' } : undefined,
        }
      }),
      userId: 1,
      projectId: task.projectId,
    },
  })

  // 更新项目进度
  await updateProjectProgress(task.projectId)
  
  revalidatePath(`/projects/${task.projectId}`)
  revalidatePath('/')
  
  return { id: task.id, name: task.name }
}

// 工时报表：获取所有任务及项目列表（用于 /reports/effort）
export async function getEffortReportData() {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
  const tasks = await prisma.task.findMany({
    include: {
      project: { select: { id: true, name: true } },
      owners: { include: { user: { select: { name: true } } } },
      owner: { select: { name: true } },
    },
    orderBy: [{ projectId: 'asc' }, { parentId: 'asc' }, { order: 'asc' }],
  })
  return {
    projects,
    tasks: tasks.map((t) => ({
      id: t.id,
      name: t.name,
      projectId: t.projectId,
      projectName: t.project.name,
      assigneeNames: t.owners.length > 0
        ? t.owners.map((o) => o.user.name).join(', ')
        : t.owner?.name ?? '',
      devManDays: Number(t.devManDays) || 0,
      testManDays: Number(t.testManDays) || 0,
      total: Number(t.devManDays) + Number(t.testManDays) || 0,
    })),
  }
}

// 删除任务（硬删除）
export async function deleteTask(taskId: number, projectId: number) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  })

  if (!task) {
    throw new Error('任务不存在')
  }

  // 记录操作历史
  await prisma.activityLog.create({
    data: {
      action: 'DELETE_TASK',
      details: JSON.stringify({ 
        taskId: task.id, 
        taskName: task.name, 
        type: task.parentId ? 'subtask' : 'parent'
      }),
      userId: 1,
      projectId: projectId,
    },
  })

  // 删除所有子任务
  await prisma.task.deleteMany({
    where: { parentId: taskId },
  })

  await prisma.task.delete({
    where: { id: taskId },
  })

  // 更新项目进度
  await updateProjectProgress(projectId)
  
  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/')
  
  return { success: true }
}

// 获取任务操作历史
export async function getTaskHistory(taskId: number) {
  const logs = await prisma.activityLog.findMany({
    where: {
      OR: [
        { details: { contains: `"taskId":${taskId}` } },
      ]
    },
    include: {
      user: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return logs.map(log => ({
    id: log.id,
    action: log.action,
    details: log.details,
    userName: log.user.name,
    createdAt: log.createdAt.toISOString(),
  }))
}

// 更新项目进度（基于工期加权算法，含防溢出保护）
export async function updateProjectProgress(projectId: number) {
  const tasks = await prisma.task.findMany({
    where: { 
      projectId,
      parentId: null, // 只计算主任务（父任务）
    },
    include: {
      children: {
        select: {
          id: true,
          status: true,
          startDate: true,
          dueDate: true,
        },
      },
    },
  })

  if (tasks.length === 0) {
    await prisma.project.update({
      where: { id: projectId },
      data: { progress: 0 },
    })
    revalidatePath('/projects')
    revalidatePath('/')
    return
  }

  const now = new Date()
  const oneDayMs = 24 * 60 * 60 * 1000

  // 辅助函数：计算单个任务的工期和进度比例
  const calculateTaskMetrics = (task: {
    status: string
    startDate: Date | null
    dueDate: Date | null
  }): { duration: number; ratio: number } => {
    // 计算工期（天数），最小为1天
    let duration = 1
    if (task.startDate && task.dueDate) {
      const diff = Math.ceil((task.dueDate.getTime() - task.startDate.getTime()) / oneDayMs)
      duration = Math.max(diff, 1)
    }

    // 根据状态计算进度比例
    let ratio = 0
    const status = task.status?.toLowerCase() || ''

    if (status === 'done' || status === '完成') {
      // 已完成：100%
      ratio = 1.0
    } else if (status === 'pending' || status === '待处理') {
      // 待处理：0%
      ratio = 0
    } else if (status === 'in progress' || status === '进行中') {
      // 进行中：基于时间流逝计算，但严格封顶在99%
      if (task.startDate) {
        const elapsed = Math.max(0, now.getTime() - task.startDate.getTime())
        const elapsedDays = elapsed / oneDayMs
        const rawRatio = elapsedDays / duration
        
        // 关键修正：强制封顶在 0.99，防止超时任务导致进度溢出
        ratio = Math.min(rawRatio, 0.99)
      } else {
        // 无开始日期，默认50%
        ratio = 0.5
      }
    }

    return { duration, ratio }
  }

  let totalDuration = 0
  let totalEarned = 0

  for (const task of tasks) {
    // 如果主任务有子任务，使用子任务汇总计算
    if (task.children.length > 0) {
      for (const child of task.children) {
        const { duration, ratio } = calculateTaskMetrics(child)
        totalDuration += duration
        totalEarned += duration * ratio
      }
    } else {
      // 主任务没有子任务，直接计算主任务
      const { duration, ratio } = calculateTaskMetrics(task)
      totalDuration += duration
      totalEarned += duration * ratio
    }
  }

  // 计算最终进度，确保在 0-100 范围内
  let progress = 0
  if (totalDuration > 0) {
    progress = Math.round((totalEarned / totalDuration) * 100)
    // 额外保护：确保进度不超过100%
    progress = Math.min(Math.max(progress, 0), 100)
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { progress },
  })

  revalidatePath('/projects')
  revalidatePath('/')
}

// 软删除项目
export async function deleteProject(projectId: number) {
  if (!projectId) {
    throw new Error('项目ID是必填项')
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { deletedAt: new Date() },
  })

  revalidatePath('/projects')
  revalidatePath('/')
  
  return { success: true }
}

// 获取所有项目（用于成员管理）
export async function getProjects() {
  return await prisma.project.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  })
}

// 添加成员
export async function createMember(data: {
  name: string
  email: string
  password: string
  role: 'Admin' | 'Normal'
  projectIds: number[]
}) {
  if (!data.name || !data.email || !data.password) {
    throw new Error('姓名、邮箱和密码是必填项')
  }

  if (data.password.length < 6) {
    throw new Error('密码长度至少为6位')
  }

  // 检查邮箱是否已存在
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existingUser) {
    throw new Error('该邮箱已被注册')
  }

  // 创建用户
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password,
      title: data.role === 'Admin' ? 'Admin' : 'Member',
      isActive: true,
    },
  })

  // 添加项目成员关系
  if (data.projectIds && data.projectIds.length > 0) {
    await prisma.projectMember.createMany({
      data: data.projectIds.map(projectId => ({
        projectId,
        userId: user.id,
        role: 'Member',
      })),
      skipDuplicates: true,
    })
  }

  revalidatePath('/members')
  
  return { id: user.id, name: user.name }
}

// 更新成员配置
export async function updateMember(data: {
  id: number
  name?: string
  email?: string
  password?: string
  role?: 'Admin' | 'Normal'
  projectIds?: number[]
}) {
  if (!data.id) {
    throw new Error('用户ID是必填项')
  }

  // 验证密码长度（如果提供）
  if (data.password && data.password.length < 6) {
    throw new Error('密码长度至少为6位')
  }

  // 更新用户基本信息
  const updateData: { name?: string; email?: string; password?: string; title?: string } = {}
  if (data.name) updateData.name = data.name
  if (data.email) updateData.email = data.email
  if (data.password) updateData.password = data.password
  if (data.role) updateData.title = data.role === 'Admin' ? 'Admin' : 'Member'

  if (Object.keys(updateData).length > 0) {
    await prisma.user.update({
      where: { id: data.id },
      data: updateData,
    })
  }

  // 更新项目成员关系
  if (data.projectIds !== undefined) {
    // 先删除现有的项目成员关系
    await prisma.projectMember.deleteMany({
      where: { userId: data.id },
    })

    // 重新添加项目成员关系
    if (data.projectIds.length > 0) {
      await prisma.projectMember.createMany({
        data: data.projectIds.map(projectId => ({
          projectId,
          userId: data.id,
          role: 'Member',
        })),
        skipDuplicates: true,
      })
    }
  }

  revalidatePath('/members')
  
  return { success: true }
}

// 获取成员详情（包含项目）
export async function getMemberWithProjects(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        include: {
          project: {
            select: { id: true, name: true }
          }
        }
      }
    }
  })

  if (!user) {
    throw new Error('用户不存在')
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.title === 'Admin' ? 'Admin' : 'Normal',
    projects: user.memberships.map(m => ({
      id: m.project.id,
      name: m.project.name,
    }))
  }
}

// 删除成员（硬删除）
export async function deleteMember(userId: number) {
  if (!userId) {
    throw new Error('用户ID是必填项')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error('用户不存在')
  }

  // 若该用户是某些项目的项目经理，先转交给其他用户（优先管理员）
  const managedCount = await prisma.project.count({
    where: { pmId: userId, deletedAt: null },
  })
  if (managedCount > 0) {
    const newPm =
      (await prisma.user.findFirst({
        where: { id: { not: userId }, isActive: true, title: 'Admin' },
      })) ??
      (await prisma.user.findFirst({
        where: { id: { not: userId }, isActive: true },
      }))
    if (!newPm) {
      throw new Error('无法删除：该用户是项目经理，且系统中没有其他可接管的用户')
    }
    await prisma.project.updateMany({
      where: { pmId: userId },
      data: { pmId: newPm.id },
    })
  }

  // 删除用户的项目成员关系
  await prisma.projectMember.deleteMany({
    where: { userId },
  })

  // 删除用户的任务负责人关系
  await prisma.taskOwner.deleteMany({
    where: { userId },
  })

  // 将用户负责的任务的 ownerId 设为 null
  await prisma.task.updateMany({
    where: { ownerId: userId },
    data: { ownerId: null },
  })

  // 删除用户
  await prisma.user.delete({
    where: { id: userId },
  })

  revalidatePath('/members')
  revalidatePath('/projects')
  revalidatePath('/')

  return { success: true }
}

// ===== 登录认证 =====

// 用户登录验证
export async function loginUser(email: string, password: string) {
  // 规范化输入：去除首尾空格，邮箱转小写（与创建成员时一致）
  const normalizedEmail = email?.trim().toLowerCase() ?? ''
  const trimmedPassword = password?.trim() ?? ''

  if (!normalizedEmail || !trimmedPassword) {
    return { success: false, message: '请填写邮箱和密码' }
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      title: true,
      isActive: true,
    },
  })

  if (!user) {
    return { success: false, message: '用户不存在' }
  }

  if (!user.isActive) {
    return { success: false, message: '账号已被禁用' }
  }

  // 简单密码验证（生产环境应使用 bcrypt 等加密）
  if (user.password !== trimmedPassword) {
    return { success: false, message: '密码错误' }
  }

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.title === 'Admin' ? 'Admin' : 'Normal',
    },
  }
}

// 修改密码
export async function changePassword(userId: number, newPassword: string) {
  if (!userId || !newPassword) {
    throw new Error('用户ID和新密码是必填项')
  }

  if (newPassword.length < 6) {
    throw new Error('密码长度至少为6位')
  }

  await prisma.user.update({
    where: { id: userId },
    data: { password: newPassword },
  })

  return { success: true }
}
