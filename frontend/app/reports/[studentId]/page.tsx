"use client"

import { useParams, useRouter } from "next/navigation"
import { ReportCard } from "@/components/report-card"
import { useStudents } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function StudentReportPage() {
  const params = useParams<{ studentId: string }>()
  const router = useRouter()
  const { data: students } = useStudents()
  const stu = students?.find((s) => s.id === params.studentId)

  if (!stu) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Student not found.</p>
        <Button className="mt-4" onClick={() => router.push("/reports")}>
          Back to Reports
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <ReportCard student={stu} />
    </div>
  )
}
