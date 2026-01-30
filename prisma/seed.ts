import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始插入测试数据...')

  // 统一登录密码（与登录验证逻辑一致，明文存储）
  const SEED_PASSWORD = 'hashed_password_here'

  // 1. 创建用户（upsert 时也更新密码，确保重跑 seed 后账号可登录）
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pepsico.com' },
    update: { password: SEED_PASSWORD, isActive: true },
    create: {
      email: 'admin@pepsico.com',
      name: '管理员用户',
      password: SEED_PASSWORD,
      title: 'Admin',
      isActive: true,
    },
  })
  console.log('✅ 创建用户: 管理员用户')

  const sarah = await prisma.user.upsert({
    where: { email: 'sarah.c@pepsico.com' },
    update: { password: SEED_PASSWORD, isActive: true },
    create: {
      email: 'sarah.c@pepsico.com',
      name: 'Sarah Connor',
      password: SEED_PASSWORD,
      title: 'Project Manager',
      isActive: true,
    },
  })
  console.log('✅ 创建用户: Sarah Connor')

  const mike = await prisma.user.upsert({
    where: { email: 'mike.r@pepsico.com' },
    update: { password: SEED_PASSWORD, isActive: true },
    create: {
      email: 'mike.r@pepsico.com',
      name: 'Mike Ross',
      password: SEED_PASSWORD,
      title: 'Engineer',
      isActive: true,
    },
  })
  console.log('✅ 创建用户: Mike Ross')

  const john = await prisma.user.upsert({
    where: { email: 'john.s@pepsico.com' },
    update: { password: SEED_PASSWORD, isActive: true },
    create: {
      email: 'john.s@pepsico.com',
      name: 'John Smith',
      password: SEED_PASSWORD,
      title: 'Engineer',
      isActive: true,
    },
  })
  console.log('✅ 创建用户: John Smith')

  // 2. 创建项目
  const project1 = await prisma.project.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: '21V 核心迁移 Alpha',
      description: '企业核心系统迁移至云端',
      budget: 1200000,
      currency: 'USD',
      status: 'In Progress',
      progress: 75,
      pmId: sarah.id,
    },
  })
  console.log('✅ 创建项目: 21V 核心迁移 Alpha')

  const project2 = await prisma.project.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'SAP 集成二期',
      description: 'SAP ERP 系统集成第二阶段',
      budget: 850000,
      currency: 'USD',
      status: 'Pending',
      progress: 30,
      pmId: john.id,
    },
  })
  console.log('✅ 创建项目: SAP 集成二期')

  const project3 = await prisma.project.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: '云安全审计',
      description: '全面的云基础设施安全审计',
      budget: 320000,
      currency: 'USD',
      status: 'UAT',
      progress: 90,
      pmId: mike.id,
    },
  })
  console.log('✅ 创建项目: 云安全审计')

  // 3. 创建项目成员
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project1.id, userId: sarah.id } },
    update: {},
    create: {
      projectId: project1.id,
      userId: sarah.id,
      role: 'Manager',
    },
  })

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project1.id, userId: mike.id } },
    update: {},
    create: {
      projectId: project1.id,
      userId: mike.id,
      role: 'Member',
    },
  })

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project1.id, userId: john.id } },
    update: {},
    create: {
      projectId: project1.id,
      userId: john.id,
      role: 'Member',
    },
  })
  console.log('✅ 创建项目成员关联')

  // 4. 创建 WBS 任务结构
  // 父任务1: 基础设施搭建
  const task1 = await prisma.task.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: '基础设施搭建',
      status: 'Done',
      priority: 'High',
      dueDate: new Date('2026-02-10'),
      projectId: project1.id,
      ownerId: mike.id,
      order: 1,
    },
  })

  // 子任务1.1: AWS VPC 配置
  await prisma.task.upsert({
    where: { id: 11 },
    update: {},
    create: {
      id: 11,
      name: 'AWS VPC 配置',
      status: 'Done',
      priority: 'High',
      dueDate: new Date('2026-01-15'),
      projectId: project1.id,
      ownerId: mike.id,
      parentId: task1.id,
      order: 1,
    },
  })

  // 子任务1.2: 负载均衡设置
  await prisma.task.upsert({
    where: { id: 12 },
    update: {},
    create: {
      id: 12,
      name: '负载均衡设置',
      status: 'Done',
      priority: 'Medium',
      dueDate: new Date('2026-01-20'),
      projectId: project1.id,
      ownerId: mike.id,
      parentId: task1.id,
      order: 2,
    },
  })

  // 父任务2: 认证模块
  const task2 = await prisma.task.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: '认证模块',
      status: 'In Progress',
      priority: 'High',
      dueDate: new Date('2026-02-15'),
      projectId: project1.id,
      ownerId: sarah.id,
      order: 2,
    },
  })

  // 子任务2.1: 登录界面开发
  await prisma.task.upsert({
    where: { id: 21 },
    update: {},
    create: {
      id: 21,
      name: '登录界面开发',
      status: 'In Progress',
      priority: 'High',
      dueDate: new Date('2026-02-05'),
      projectId: project1.id,
      ownerId: sarah.id,
      parentId: task2.id,
      order: 1,
    },
  })

  // 子任务2.2: OAuth 集成
  await prisma.task.upsert({
    where: { id: 22 },
    update: {},
    create: {
      id: 22,
      name: 'OAuth 集成',
      status: 'Pending',
      priority: 'Medium',
      dueDate: new Date('2026-02-12'),
      projectId: project1.id,
      ownerId: john.id,
      parentId: task2.id,
      order: 2,
    },
  })

  // 父任务3: 报表仪表盘 (无子任务)
  await prisma.task.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: '报表仪表盘',
      status: 'Pending',
      priority: 'Medium',
      dueDate: new Date('2026-03-01'),
      projectId: project1.id,
      ownerId: john.id,
      order: 3,
    },
  })

  console.log('✅ 创建 WBS 任务结构')

  // 5. 创建紧急任务（用于 Dashboard 展示）
  await prisma.task.upsert({
    where: { id: 101 },
    update: {},
    create: {
      id: 101,
      name: '数据库架构定稿',
      status: 'Pending',
      priority: 'Critical',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2天后
      projectId: project1.id,
      ownerId: sarah.id,
      order: 100,
    },
  })

  await prisma.task.upsert({
    where: { id: 102 },
    update: {},
    create: {
      id: 102,
      name: '防火墙规则更新',
      status: 'Pending',
      priority: 'Critical',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1天后
      projectId: project1.id,
      ownerId: mike.id,
      order: 101,
    },
  })

  await prisma.task.upsert({
    where: { id: 103 },
    update: {},
    create: {
      id: 103,
      name: '用户验收签字',
      status: 'UAT',
      priority: 'High',
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4天后
      projectId: project3.id,
      ownerId: john.id,
      order: 102,
    },
  })

  console.log('✅ 创建紧急任务')

  console.log('')
  console.log('🎉 测试数据插入完成！')
  console.log('')
  console.log('📊 数据统计:')
  console.log(`   - 用户: ${await prisma.user.count()} 人`)
  console.log(`   - 项目: ${await prisma.project.count()} 个`)
  console.log(`   - 任务: ${await prisma.task.count()} 条`)
  console.log(`   - 成员关联: ${await prisma.projectMember.count()} 条`)
}

main()
  .catch((e) => {
    console.error('❌ Seed 失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
