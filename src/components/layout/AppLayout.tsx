"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { AuthProvider } from "@/components/providers/AuthProvider"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"

  return (
    <AuthProvider>
      {isLoginPage ? (
        // 登录页不显示侧边栏
        <>{children}</>
      ) : (
        // 其他页面显示侧边栏
        <>
          <Sidebar />
          <main className="flex-1 ml-[260px] min-h-screen main-ambient">
            {children}
          </main>
        </>
      )}
    </AuthProvider>
  )
}
