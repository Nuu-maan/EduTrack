"use client"

import Layout from "@/components/Layout"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { studentsAPI, attendanceAPI, marksAPI } from "@/lib/api"
import { KpiCard } from "@/components/kpi-card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, BookOpen, BarChart3 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/components/ui/use-toast"

const statsInit = [
  { name: "Total Students", value: "0", icon: Users },
  { name: "Attendance Today", value: "0%", icon: Calendar },
  { name: "Average Marks", value: "0%", icon: BookOpen },
  { name: "Reports Generated", value: "0", icon: BarChart3 },
]

export default function Home() {
  const [liveStats, setLiveStats] = useState(statsInit)
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading || !user) return
    const run = async () => {
      try {
        const students = await studentsAPI.getStudents()
        const totalStudents = students.length

        const today = new Date().toISOString().split("T")[0]
        const attendance = await attendanceAPI.getAttendanceByDate(today)
        const present = attendance.filter((a) => a.status === "Present").length
        const attPct = totalStudents > 0 ? Math.round((present / totalStudents) * 100) : 0

        // Average of last marks across all students (simple heuristic)
        let avgPct = 0
        if (totalStudents > 0) {
          let sum = 0
          let count = 0
          for (const s of students) {
            const marks = await marksAPI.getStudentMarks(s.student_id)
            if (marks.length) {
              const latest = marks[marks.length - 1]
              sum += (latest.marks_obtained / latest.total_marks) * 100
              count += 1
            }
          }
          avgPct = count > 0 ? Math.round(sum / count) : 0
        }

        setLiveStats([
          { ...statsInit[0], value: String(totalStudents) },
          { ...statsInit[1], value: `${attPct}%` },
          { ...statsInit[2], value: `${avgPct}%` },
          { ...statsInit[3], value: String(Math.max(totalStudents - 1, 0)) }, // simple placeholder
        ])
      } catch (e: any) {
        const msg = e?.message || "Failed to load dashboard"
        toast({ title: "Error", description: msg, variant: "destructive" })
      }
    }
    void run()
  }, [authLoading, user, toast])

  return (
    <Layout>
      <main className="p-6 md:p-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-pretty text-2xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back!</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {liveStats.map((s) => {
            const Icon = s.icon
            return (
              <KpiCard
                key={s.name}
                title={s.name}
                value={s.value}
                icon={<Icon className="h-5 w-5" aria-hidden="true" />}
              />
            )
          })}
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Manage Students"
            value=""
            icon={<Users className="h-6 w-6 text-primary" aria-hidden="true" />}
            action={
              <Link href="/students" className="w-full">
                <Button className="w-full">Manage Students</Button>
              </Link>
            }
          />
          <KpiCard
            title="Mark Attendance"
            value=""
            icon={<Calendar className="h-6 w-6 text-primary" aria-hidden="true" />}
            action={
              <Link href="/attendance" className="w-full">
                <Button variant="secondary" className="w-full">
                  Mark Attendance
                </Button>
              </Link>
            }
          />
          <KpiCard
            title="Add Marks"
            value=""
            icon={<BookOpen className="h-6 w-6 text-primary" aria-hidden="true" />}
            action={
              <Link href="/marks" className="w-full">
                <Button variant="outline" className="w-full bg-transparent">
                  Add Marks
                </Button>
              </Link>
            }
          />
          <KpiCard
            title="Generate Report"
            value=""
            icon={<BarChart3 className="h-6 w-6 text-primary" aria-hidden="true" />}
            action={
              <Link href="/reports" className="w-full">
                <Button variant="outline" className="w-full bg-transparent">
                  Generate Report
                </Button>
              </Link>
            }
          />
        </section>
      </main>
    </Layout>
  )
}
