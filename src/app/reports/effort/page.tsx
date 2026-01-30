import { TopBar } from "@/components/layout/TopBar"
import { getEffortReportData } from "@/app/actions"
import { EffortReportClient } from "./EffortReportClient"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function EffortReportPage() {
  const { projects, tasks } = await getEffortReportData()
  return (
    <div className="space-y-6 p-10">
      <TopBar />
      <EffortReportClient projects={projects} tasks={tasks} />
    </div>
  )
}
