"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  id: number
  name: string
  email: string
  role: "Admin" | "Normal"
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

interface AuthProviderProps {
  children: ReactNode
}

// 仅在客户端从 localStorage 读取用户（服务端返回 null）
function getStoredUser(): User | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem("user")
    if (!stored) return null
    return JSON.parse(stored) as User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    try {
      const stored = getStoredUser()
      if (stored) {
        setUser(stored)
        setIsLoading(false)
        return
      }
    } catch (e) {
      console.error("Auth check error:", e)
    }
    setUser(null)
    setIsLoading(false)
    if (pathname !== "/login") {
      router.push("/login")
    }
  }, [pathname, router])

  const logout = () => {
    // 清除用户信息
    localStorage.removeItem("user")
    setUser(null)
    // 跳转到登录页
    router.push("/login")
  }

  // 如果在登录页，直接渲染子组件
  if (pathname === "/login") {
    return <>{children}</>
  }

  // 加载中显示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] animate-pulse" />
          <p className="text-[14px] text-[#8E8E93]">加载中...</p>
        </div>
      </div>
    )
  }

  // 未登录且不在登录页，显示空白（正在跳转）
  if (!user && pathname !== "/login") {
    return null
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
