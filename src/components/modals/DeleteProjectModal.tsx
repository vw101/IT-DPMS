"use client"

import { useTransition } from "react"
import { Modal } from "@/components/ui/Modal"
import { deleteProject } from "@/app/actions"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"

interface DeleteProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project: {
    id: number
    name: string
  }
}

export function DeleteProjectModal({ isOpen, onClose, project }: DeleteProjectModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        await deleteProject(project.id)
        onClose()
        router.push('/projects')
        router.refresh()
      } catch (error) {
        alert("删除项目失败，请重试")
        console.error(error)
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="删除项目" size="sm">
      <div className="space-y-5">
        {/* 警告图标 */}
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-[#FF3B30]/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-[#FF3B30]" />
          </div>
        </div>

        {/* 提示信息 */}
        <div className="text-center">
          <p className="text-[15px] text-[#1d1d1f] font-medium mb-2">
            确定要删除项目吗？
          </p>
          <p className="text-[14px] text-[#636366] bg-[#F5F5F7] rounded-lg py-2 px-3">
            {project.name}
          </p>
          <p className="text-[13px] text-[#8E8E93] mt-3">
            删除后项目将不再显示在项目矩阵中
          </p>
        </div>

        {/* 按钮 */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-5 py-2.5 rounded-full text-[13px] font-medium text-[#636366] bg-[#F5F5F7] hover:bg-[#E5E5EA] transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="flex-1 bg-gradient-to-b from-[#FF3B30] to-[#D70015] text-white px-5 py-2.5 rounded-full font-medium text-[13px] shadow-sm hover:shadow-lg hover:shadow-red-500/30 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "删除中..." : "确认删除"}
          </button>
        </div>
      </div>
    </Modal>
  )
}
