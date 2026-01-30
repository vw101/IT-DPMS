import { TopBar } from "@/components/layout/TopBar"
import { prisma } from "@/lib/prisma"
import { MembersClient } from "./client"

// 禁用缓存，确保数据始终是最新的
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MembersPage() {
  // 从数据库获取用户列表（包含项目信息）
  const users = await prisma.user.findMany({
    where: {
      isActive: true,
    },
    include: {
      memberships: {
        include: {
          project: {
            select: {
              id: true,
              name: true,
              deletedAt: true,
            }
          }
        }
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // 获取所有项目（用于添加/编辑成员时选择）
  const projects = await prisma.project.findMany({
    where: {
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  // 转换为组件期望的格式
  const members = users.map((user) => {
    // 过滤掉已删除的项目
    const activeProjects = user.memberships
      .filter(m => m.project.deletedAt === null)
      .map(m => ({
        id: m.project.id,
        name: m.project.name,
      }))

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user.title === 'Admin' || user.email.includes('admin') ? 'Admin' : 'Normal') as 'Admin' | 'Normal',
      projectIds: activeProjects.map(p => p.id),
      projectNames: activeProjects.map(p => p.name),
    }
  })

  return (
    <div className="space-y-8 p-10">
      <TopBar />
      <MembersClient members={members} projects={projects} />
    </div>
  )
}
