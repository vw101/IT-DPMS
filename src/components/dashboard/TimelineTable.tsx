import { Badge, BadgeStatus } from "@/components/ui/Badge"

// 时间线项目类型定义
export interface TimelineItem {
  id: number
  project: string
  item: string
  status: BadgeStatus
  start: string
  end: string
}

interface TimelineTableProps {
  items: TimelineItem[]
}

export function TimelineTable({ items }: TimelineTableProps) {
  return (
    // 完全按照 prototype.tsx 的 styles.card
    <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-white hover:border-[#007AFF]/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
      {/* Header - 源码: border-b border-[#F5F5F7] */}
      <div className="p-6 flex justify-between items-center border-b border-[#F5F5F7]">
        {/* 源码 styles.h3: text-[13px] font-bold text-[#636366] tracking-wide uppercase */}
        <h3 className="text-[13px] font-bold text-[#636366] tracking-wide uppercase">
          Q1 交付进度总览
        </h3>
        <div className="flex gap-2">
          {/* 源码: bg-[#F2F2F7] */}
          <div className="bg-[#F2F2F7] p-1 rounded-lg flex text-[12px] font-medium text-[#636366]">
            <button className="px-3 py-1 bg-white rounded shadow-sm text-[#1d1d1f]">时间轴</button>
            <button className="px-3 py-1 hover:text-[#1d1d1f]">列表</button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* 源码: bg-[#FAFAFA] text-[#86868b] */}
          <thead className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider bg-[#FAFAFA] border-b border-[#F5F5F7]">
            <tr>
              <th className="px-6 py-4 pl-8">项目名称</th>
              <th className="px-6 py-4">阶段节点</th>
              <th className="px-6 py-4">状态</th>
              <th className="px-6 py-4 w-1/3">里程碑进度</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {items.map((row) => (
              <tr key={row.id} className="hover:bg-[#F5F5F7]/50 transition-colors border-b border-[#F5F5F7] last:border-0 group">
                <td className="px-6 py-5 pl-8 font-semibold text-[#1d1d1f]">{row.project}</td>
                <td className="px-6 py-5 text-[#636366]">{row.item}</td>
                <td className="px-6 py-5">
                  <Badge status={row.status} />
                </td>
                <td className="px-6 py-5">
                  {/* 源码进度条: h-2, w-10 */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#86868b] font-mono w-10 text-right">{row.start}</span>
                    <div className="h-2 flex-1 bg-[#F2F2F7] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${row.status === 'Done' ? 'bg-[#34C759]' : 'bg-[#007AFF]'}`} 
                        style={{ width: `${Math.random() * 60 + 20}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-[#86868b] font-mono w-10">{row.end}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
