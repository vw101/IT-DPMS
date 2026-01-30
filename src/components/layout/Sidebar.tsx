"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Briefcase, 
  Users,
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/providers/AuthProvider"

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // 根据用户角色生成菜单
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: '交付概览', href: '/' },
    { id: 'projects', icon: Briefcase, label: '项目矩阵', href: '/projects' },
    ...(user?.role === 'Admin' ? [{ id: 'members', icon: Users, label: '成员权限', href: '/members' }] : []),
    { id: 'reports-effort', icon: BarChart3, label: '工时统计', href: '/reports/effort' },
  ]

  const handleLogout = () => {
    if (confirm("确定要退出登录吗？")) {
      logout()
    }
  }

  // 获取用户头像首字母
  const getInitial = () => {
    if (!user?.name) return "U"
    return user.name.charAt(0).toUpperCase()
  }

  return (
    <div className="w-[260px] h-screen fixed left-0 top-0 flex flex-col z-50 pt-8 pb-6 select-none bg-white/70 backdrop-blur-xl border-r border-white/40 shadow-[inset_1px_0_0_rgba(255,255,255,0.5)]">
      
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="h-9 w-9 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 font-semibold text-[14px] border-t border-white/20">
          IT
        </div>
        <div>
          <h1 className="text-[16px] font-semibold text-slate-900 tracking-tight leading-none">IT-PDMS</h1>
          <p className="text-[10px] text-slate-500 font-medium mt-1 tracking-wide">ENTERPRISE EDITION</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <div className="px-3 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider opacity-70">主菜单</div>
        {menuItems.map((item) => {
          const isActive = 
            (item.id === 'dashboard' && pathname === '/') || 
            (item.id === 'reports-effort' && pathname?.startsWith('/reports/effort')) ||
            (item.id !== 'dashboard' && item.id !== 'reports-effort' && pathname?.startsWith(`/${item.id}`));
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-gradient-to-b from-blue-500 to-blue-600 text-white border-t border-white/20 shadow-lg shadow-blue-500/20" 
                  : "text-slate-700 hover:bg-slate-200/50"
              )}
            >
              <item.icon 
                className={cn(
                  "h-4 w-4",
                  isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900"
                )} 
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 pt-6 border-t border-black/5" data-sidebar="user-area">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-black/5 to-transparent mb-4" />
        <div className="flex items-center gap-3 p-2 rounded-xl">
          <div className="h-9 w-9 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center text-[13px] font-semibold text-white shadow-lg shadow-blue-500/20 border-t border-white/20 flex-shrink-0">
            {getInitial()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-900 truncate">
              {user?.name || "用户"}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {user?.email || ""}
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="text-[11px] text-slate-500 hover:text-slate-700 mt-0.5 transition-colors block"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
