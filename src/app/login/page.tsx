"use client"

import { useState, useTransition } from "react"
import { Layers, Eye, EyeOff, Lock, Mail } from "lucide-react"
import { loginUser } from "@/app/actions"

export default function LoginPage() {
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("请填写邮箱和密码")
      return
    }

    startTransition(async () => {
      try {
        const result = await loginUser(email, password)
        if (result.success && result.user) {
          // 登录成功，存储用户信息到 localStorage
          localStorage.setItem("user", JSON.stringify(result.user))
          // 使用整页跳转，确保 AuthProvider 重新挂载时能读到 localStorage，避免竞态导致无法进入首页
          window.location.href = "/"
          return
        }
        setError(result.message || "登录失败")
      } catch (err) {
        setError("登录失败，请重试")
        console.error(err)
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F7] via-white to-[#E8F4FD] flex items-center justify-center p-4">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#007AFF]/10 to-[#5856D6]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#34C759]/10 to-[#007AFF]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      </div>

      {/* 登录卡片 */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-[28px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-white/50 p-8 md:p-10">
          {/* Logo 和标题 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] shadow-lg shadow-blue-500/30 mb-4">
              <Layers className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-[24px] font-bold text-[#1d1d1f] tracking-tight">
              项目管理系统
            </h1>
            <p className="text-[14px] text-[#8E8E93] mt-2">
              登录以继续访问
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl">
              <p className="text-[13px] text-[#FF3B30] text-center font-medium">
                {error}
              </p>
            </div>
          )}

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 邮箱 */}
            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8E8E93]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#F5F5F7] border border-transparent rounded-xl text-[15px] text-[#1d1d1f] placeholder-[#8E8E93] focus:bg-white focus:border-[#007AFF]/30 focus:shadow-[0_0_0_4px_rgba(0,122,255,0.1)] outline-none transition-all"
                />
              </div>
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8E8E93]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-12 pr-12 py-3.5 bg-[#F5F5F7] border border-transparent rounded-xl text-[15px] text-[#1d1d1f] placeholder-[#8E8E93] focus:bg-white focus:border-[#007AFF]/30 focus:shadow-[0_0_0_4px_rgba(0,122,255,0.1)] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#636366] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-b from-[#007AFF] to-[#0062CC] text-white py-4 rounded-xl font-semibold text-[15px] shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  登录中...
                </span>
              ) : (
                "登录"
              )}
            </button>
          </form>

          {/* 底部提示 */}
          <div className="mt-8 pt-6 border-t border-[#E5E5EA]">
            <p className="text-[12px] text-[#8E8E93] text-center">
              如果忘记密码，请联系系统管理员重置
            </p>
          </div>
        </div>

        {/* 版权信息 */}
        <p className="text-center text-[12px] text-[#8E8E93] mt-6">
          © 2026 项目管理系统. All rights reserved.
        </p>
      </div>
    </div>
  )
}
