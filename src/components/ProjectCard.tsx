"use client"

import { useRef, useState, useCallback } from "react"
import Link from "next/link"
import { Badge, BadgeStatus } from "@/components/ui/Badge"
import { AlertCircle, Edit } from "lucide-react"
import { formatPmName } from "@/lib/formatters"

interface ProjectCardProps {
  project: {
    id: number
    name: string
    description?: string
    owner: string
    progress: number
    status: BadgeStatus
    projectType?: string
    members: number
    urgentCount: number
    budget: string
    memberIds: number[]
    memberUsers: { id: number; name: string; avatar: string | null }[]
  }
  leftBorderColor: string
  statusForBadge: BadgeStatus
  onEdit: (e: React.MouseEvent, project: ProjectCardProps["project"]) => void
}

export function ProjectCard({ project, leftBorderColor, statusForBadge, onEdit }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = cardRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setMouse({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsHovering(true)
    },
    []
  )

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
  }, [])

  return (
    <Link href={`/projects/${project.id}`}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`
          relative rounded-2xl overflow-hidden
          bg-white/70 backdrop-blur-xl
          border border-white/40
          shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.6)]
          hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.6)]
          transition-all duration-300 group cursor-pointer
          border-l-4 ${leftBorderColor}
        `}
      >
        {/* 鼠标跟随光斑：大而柔和，极淡冷白光，透明度 ≤15% */}
        {isHovering && (
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
            style={{
              background: `radial-gradient(
                circle 420px at ${mouse.x}px ${mouse.y}px,
                rgba(255,255,255,0.12) 0%,
                rgba(255,255,255,0.04) 40%,
                transparent 65%
              )`,
            }}
            aria-hidden
          />
        )}

        <div className="relative p-3.5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-[16px] font-semibold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight truncate">
                  {project.name}
                </h3>
                {project.projectType && (
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-md flex-shrink-0 ${
                      project.projectType === "Support" || project.projectType === "支持"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                    title={
                      project.projectType === "Support" || project.projectType === "支持"
                        ? "运维"
                        : "变更需求"
                    }
                  >
                    {project.projectType === "Support" || project.projectType === "支持"
                      ? "运维"
                      : "变更需求"}
                  </span>
                )}
              </div>
              <p className="text-[12px] text-slate-500">PM: {formatPmName(project.owner)}</p>
            </div>
            <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
              {project.urgentCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {project.urgentCount}
                </span>
              )}
              <button
                onClick={(e) => onEdit(e, project)}
                className="p-1.5 rounded-md bg-slate-100/80 hover:bg-slate-200/90 text-slate-600 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                title="编辑项目"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-[11px] font-medium">
              <span className="text-slate-500">完成度</span>
              <span className="text-slate-900 font-semibold tabular-nums">{project.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-slate-200/80">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  project.progress === 0 ? "bg-slate-300" : "bg-gradient-to-b from-blue-500 to-blue-600"
                }`}
                style={{ width: `${Math.max(project.progress, 2)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100/80">
            <div className="flex -space-x-1.5 items-center">
              {project.memberUsers.slice(0, 3).map((member, i) => (
                <div
                  key={member.id}
                  className="h-7 w-7 rounded-full bg-slate-100/90 border-[2px] border-white/80 flex items-center justify-center text-[10px] font-semibold text-slate-600 shadow-sm hover:scale-110 hover:z-20 transition-transform cursor-pointer"
                  style={{ zIndex: 10 - i }}
                  title={member.name}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {project.memberUsers.length === 0 && (
                <>
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-7 w-7 rounded-full bg-slate-100/90 border-[2px] border-white/80 flex items-center justify-center text-[10px] font-semibold text-slate-500 shadow-sm"
                      style={{ zIndex: 10 - i }}
                    >
                      ?
                    </div>
                  ))}
                </>
              )}
              <div className="h-7 w-7 rounded-full bg-white/90 border border-gray-200/80 flex items-center justify-center text-[12px] font-medium text-blue-600 shadow-sm hover:bg-blue-50 hover:scale-110 transition-all cursor-pointer">
                +
              </div>
            </div>
            <Badge status={statusForBadge} />
          </div>
        </div>
      </div>
    </Link>
  )
}
