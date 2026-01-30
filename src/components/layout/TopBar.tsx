"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Briefcase, Users, Bell, Calendar, ChevronRight, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

export function TopBar() {
  const pathname = usePathname()

  const getBreadcrumb = () => {
    if (pathname === '/') {
      return (
        <div className="flex items-center gap-2 text-enterprise-text-primary">
          <LayoutDashboard className="h-4 w-4 text-enterprise-text-secondary" />
          <span className="text-[14px] font-semibold">交付概览</span>
        </div>
      )
    }
    if (pathname === '/projects') {
      return (
        <div className="flex items-center gap-2 text-enterprise-text-primary">
          <Briefcase className="h-4 w-4 text-enterprise-text-secondary" />
          <span className="text-[14px] font-semibold">项目矩阵</span>
        </div>
      )
    }
    if (pathname?.startsWith('/projects/')) {
      return (
        <div className="flex items-center gap-2 text-[13px] font-medium">
          <Link
            href="/projects"
            className="text-enterprise-text-secondary hover:text-enterprise-text-primary transition-colors"
          >
            项目矩阵
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-enterprise-border" />
          <span className="text-enterprise-text-primary bg-enterprise-card/50 px-2 py-0.5 rounded-md border border-enterprise-border shadow-sm">
            项目详情
          </span>
        </div>
      )
    }
    if (pathname === '/members') {
      return (
        <div className="flex items-center gap-2 text-enterprise-text-primary">
          <Users className="h-4 w-4 text-enterprise-text-secondary" />
          <span className="text-[14px] font-semibold">成员权限</span>
        </div>
      )
    }
    if (pathname?.startsWith('/reports/effort')) {
      return (
        <div className="flex items-center gap-2 text-enterprise-text-primary">
          <BarChart3 className="h-4 w-4 text-enterprise-text-secondary" />
          <span className="text-[14px] font-semibold">工时统计</span>
        </div>
      )
    }
    return null
  }

  const getCurrentDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const day = now.getDate()
    return `${year}年${month}月${day}日`
  }

  return (
    <div className="flex justify-between items-center mb-10 sticky top-0 z-40 py-3 -mt-3 px-4 rounded-b-[20px] bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-[0_1px_0_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.6)]">
      {/* Left Side: Contextual Breadcrumb */}
      <div className="flex-1">
        {getBreadcrumb()}
      </div>

      {/* Right Side: Tools */}
      <div className="flex items-center gap-6">
        <button className="relative text-enterprise-text-secondary hover:text-enterprise-text-primary transition-colors p-2 rounded-full hover:bg-white/60 shadow-sm hover:shadow-md active:scale-95 duration-200">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-2 h-2 w-2 bg-enterprise-red rounded-full border-2 border-enterprise-bg"></span>
        </button>
        <div className="w-[1px] h-5 bg-gray-200"></div>
        <div className="flex items-center gap-2.5 text-[13px] font-medium text-slate-600 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span>{getCurrentDate()}</span>
        </div>
      </div>
    </div>
  )
}
