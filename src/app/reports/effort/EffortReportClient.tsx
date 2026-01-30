"use client"

import { useMemo, useState } from "react"
import { BarChart3, Download } from "lucide-react"

interface Project {
  id: number
  name: string
}

interface EffortRow {
  id: number
  name: string
  projectId: number
  projectName: string
  assigneeNames: string
  devManDays: number
  testManDays: number
  total: number
}

interface EffortReportClientProps {
  projects: Project[]
  tasks: EffortRow[]
}

function escapeCsvCell(value: string | number): string {
  const s = String(value)
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function EffortReportClient({ projects, tasks }: EffortReportClientProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")

  const filteredTasks = useMemo(() => {
    if (!selectedProjectId) return tasks
    const pid = parseInt(selectedProjectId, 10)
    if (Number.isNaN(pid)) return tasks
    return tasks.filter((t) => t.projectId === pid)
  }, [tasks, selectedProjectId])

  const summary = useMemo(() => {
    const dev = filteredTasks.reduce((a, t) => a + t.devManDays, 0)
    const test = filteredTasks.reduce((a, t) => a + t.testManDays, 0)
    return {
      total: dev + test,
      dev,
      test,
    }
  }, [filteredTasks])

  const handleExportCsv = () => {
    const headers = ["项目名称", "任务名称", "负责人", "开发人天", "测试人天", "合计"]
    const rows = filteredTasks.map((t) => [
      t.projectName,
      t.name,
      t.assigneeNames,
      t.devManDays,
      t.testManDays,
      t.total,
    ])
    const csvContent = [
      headers.map(escapeCsvCell).join(","),
      ...rows.map((r) => r.map(escapeCsvCell).join(",")),
    ].join("\n")
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Effort-Report-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[20px] font-semibold text-slate-900 tracking-tight">工时资源统计</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">Resource Effort Reporting</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 bg-gradient-to-b from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-full font-medium text-[13px] shadow-lg shadow-blue-500/20 border-t border-white/20 hover:shadow-blue-500/30 active:scale-[0.98] transition-all"
        >
          <Download className="h-4 w-4" /> 导出 CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.6)] p-5">
          <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">总计 Total Effort</p>
          <p className="text-[24px] font-bold text-slate-900 mt-1 tabular-nums">{summary.total.toFixed(1)}</p>
          <p className="text-[12px] text-slate-400 mt-0.5">Days</p>
        </div>
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.6)] p-5">
          <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">开发合计 Dev Effort</p>
          <p className="text-[24px] font-bold text-blue-600 mt-1 tabular-nums">{summary.dev.toFixed(1)}</p>
          <p className="text-[12px] text-slate-400 mt-0.5">Days</p>
        </div>
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.6)] p-5">
          <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">测试合计 Test Effort</p>
          <p className="text-[24px] font-bold text-emerald-600 mt-1 tabular-nums">{summary.test.toFixed(1)}</p>
          <p className="text-[12px] text-slate-400 mt-0.5">Days</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="text-[13px] font-medium text-slate-700">选择项目</label>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="min-w-[200px] px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[14px] text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
        >
          <option value="">All Projects（全部项目）</option>
          {projects.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white/70 backdrop-blur-xl shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#F5F5F7] text-[11px] font-bold text-[#86868b] uppercase tracking-wider">
                <th className="px-6 py-3.5">项目名称</th>
                <th className="px-6 py-3.5">任务名称</th>
                <th className="px-6 py-3.5">负责人</th>
                <th className="px-6 py-3.5 text-right">开发人天</th>
                <th className="px-6 py-3.5 text-right">测试人天</th>
                <th className="px-6 py-3.5 text-right">合计</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[14px] text-slate-500">
                    {tasks.length === 0 ? "暂无任务数据" : "当前筛选下无数据"}
                  </td>
                </tr>
              ) : (
                filteredTasks.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-b border-[#F5F5F7] transition-colors ${
                      index % 2 === 1 ? "bg-slate-50/50" : ""
                    }`}
                  >
                    <td className="px-6 py-3 text-[14px] text-slate-900 font-medium">{row.projectName}</td>
                    <td className="px-6 py-3 text-[14px] text-slate-800">{row.name}</td>
                    <td className="px-6 py-3 text-[13px] text-slate-600">{row.assigneeNames || "—"}</td>
                    <td className="px-6 py-3 text-[14px] text-slate-700 text-right tabular-nums">
                      {row.devManDays.toFixed(1)}
                    </td>
                    <td className="px-6 py-3 text-[14px] text-slate-700 text-right tabular-nums">
                      {row.testManDays.toFixed(1)}
                    </td>
                    <td className="px-6 py-3 text-[14px] font-semibold text-slate-900 text-right tabular-nums">
                      {row.total.toFixed(1)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
