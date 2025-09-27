"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Layout from "@/components/Layout"
import { reportsAPI, studentsAPI, type Student, type StudentReport } from "@/lib/api"
import Dropdown from "@/components/Dropdown"
import Link from "next/link"

export default function StudentDetailPage() {
  const params = useParams<{ studentId: string }>()
  const id = Number.parseInt(params.studentId)

  const [students, setStudents] = useState<Student[]>([])
  const [primary, setPrimary] = useState<Student | null>(null)
  const [primaryReport, setPrimaryReport] = useState<StudentReport | null>(null)

  const [compareId, setCompareId] = useState<string>("")
  const [compare, setCompare] = useState<Student | null>(null)
  const [compareReport, setCompareReport] = useState<StudentReport | null>(null)

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const list = await studentsAPI.getStudents()
        setStudents(list)
        const me = list.find((s) => s.student_id === id) || null
        setPrimary(me)
        if (me) {
          const rep = await reportsAPI.getStudentReport(me.student_id)
          setPrimaryReport(rep)
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load student")
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [id])

  useEffect(() => {
    const loadCompare = async () => {
      if (!compareId) {
        setCompare(null)
        setCompareReport(null)
        return
      }
      try {
        const cid = Number.parseInt(compareId)
        const c = students.find((s) => s.student_id === cid) || null
        setCompare(c)
        if (c) {
          const rep = await reportsAPI.getStudentReport(c.student_id)
          setCompareReport(rep)
        }
      } catch {}
    }
    void loadCompare()
  }, [compareId, students])

  const summary = useMemo(() => {
    const avg = (r?: StudentReport | null) => {
      if (!r || !r.marks_summary?.length) return 0
      const totalMo = r.marks_summary.reduce((s, m) => s + m.marks_obtained, 0)
      const totalTm = r.marks_summary.reduce((s, m) => s + m.total_marks, 0)
      return totalTm > 0 ? Math.round((totalMo / totalTm) * 100) : 0
    }

    const left = primaryReport
      ? {
          attendance: primaryReport.attendance_summary?.attendance_percentage ?? 0,
          exams: primaryReport.marks_summary?.length ?? 0,
          avgMarks: avg(primaryReport),
        }
      : { attendance: 0, exams: 0, avgMarks: 0 }
    const right = compareReport
      ? {
          attendance: compareReport.attendance_summary?.attendance_percentage ?? 0,
          exams: compareReport.marks_summary?.length ?? 0,
          avgMarks: avg(compareReport),
        }
      : { attendance: 0, exams: 0, avgMarks: 0 }
    return { left, right }
  }, [primaryReport, compareReport])

  const subjectAverages = useMemo(() => {
    const calc = (r?: StudentReport | null) => {
      const map = new Map<string, number[]>()
      if (r?.marks_summary) {
        for (const m of r.marks_summary) {
          const pct = (m.marks_obtained / m.total_marks) * 100
          if (!map.has(m.subject)) map.set(m.subject, [])
          map.get(m.subject)!.push(pct)
        }
      }
      return Array.from(map.entries()).map(([subject, arr]) => ({
        subject,
        avg: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length),
      }))
    }
    return { left: calc(primaryReport), right: calc(compareReport) }
  }, [primaryReport, compareReport])

  const recentExams = useMemo(() => {
    const pick = (r?: StudentReport | null) => (r?.marks_summary || []).slice(-5).reverse()
    return { left: pick(primaryReport), right: pick(compareReport) }
  }, [primaryReport, compareReport])

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm">{error}</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Student Details</h1>
            <p className="text-sm text-muted-foreground">View and compare student performance</p>
          </div>
          <Link href="/students" className="text-sm text-muted-foreground hover:underline">
            ← Back to Students
          </Link>
        </div>

        {/* Profile summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-medium mb-2">{primary?.name ?? "-"}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Class</p>
                <p className="text-base font-semibold">{primary?.class_name ?? "-"}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Roll No</p>
                <p className="text-base font-semibold">{primary?.roll_no ?? "-"}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Attendance %</p>
                <p className="text-base font-semibold">{summary.left.attendance}%</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Avg Marks</p>
                <p className="text-base font-semibold">{summary.left.avgMarks}%</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-medium mb-2">{compare?.name ?? "No selection"}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Class</p>
                <p className="text-base font-semibold">{compare?.class_name ?? "-"}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Roll No</p>
                <p className="text-base font-semibold">{compare?.roll_no ?? "-"}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Attendance %</p>
                <p className="text-base font-semibold">{summary.right.attendance}%</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Avg Marks</p>
                <p className="text-base font-semibold">{summary.right.avgMarks}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Compare selector */}
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3">Compare with another student</h3>
          <div className="max-w-md">
            <Dropdown
              value={compareId}
              onChange={setCompareId}
              placeholder="Choose a student to compare"
              options={students.filter((s) => s.student_id !== id).map((s) => ({ label: `${s.name} - ${s.class_name} (Roll: ${s.roll_no})`, value: String(s.student_id) }))}
            />
          </div>
        </div>

        {/* Comparison metrics */}
        {(primaryReport || compareReport) && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Left metrics */}
            <div className="bg-card border rounded-lg p-4">
              <h4 className="font-medium mb-4">{primary?.name || "-"} • Key Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Attendance %</p>
                  <p className="text-xl font-semibold">{summary.left.attendance}%</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Avg Marks</p>
                  <p className="text-xl font-semibold">{summary.left.avgMarks}%</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Exams</p>
                  <p className="text-xl font-semibold">{summary.left.exams}</p>
                </div>
              </div>
              <div className="mt-4">
                <h5 className="text-sm font-medium mb-2">Recent Exams</h5>
                <div className="space-y-2">
                  {recentExams.left.map((m, i) => (
                    <div key={i} className="flex items-center justify-between rounded-md border p-2">
                      <div>
                        <p className="text-sm font-medium">{m.subject} • {m.exam_name}</p>
                        <p className="text-xs text-muted-foreground">{m.marks_obtained}/{m.total_marks}</p>
                      </div>
                      <span className="text-sm font-semibold">{Math.round((m.marks_obtained / m.total_marks) * 100)}%</span>
                    </div>
                  ))}
                  {recentExams.left.length === 0 && (
                    <p className="text-xs text-muted-foreground">No recent exams</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right metrics */}
            <div className="bg-card border rounded-lg p-4">
              <h4 className="font-medium mb-4">{compare?.name || "No selection"} • Key Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Attendance %</p>
                  <p className="text-xl font-semibold">{summary.right.attendance}%</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Avg Marks</p>
                  <p className="text-xl font-semibold">{summary.right.avgMarks}%</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Exams</p>
                  <p className="text-xl font-semibold">{summary.right.exams}</p>
                </div>
              </div>
              <div className="mt-4">
                <h5 className="text-sm font-medium mb-2">Recent Exams</h5>
                <div className="space-y-2">
                  {recentExams.right.map((m, i) => (
                    <div key={i} className="flex items-center justify-between rounded-md border p-2">
                      <div>
                        <p className="text-sm font-medium">{m.subject} • {m.exam_name}</p>
                        <p className="text-xs text-muted-foreground">{m.marks_obtained}/{m.total_marks}</p>
                      </div>
                      <span className="text-sm font-semibold">{Math.round((m.marks_obtained / m.total_marks) * 100)}%</span>
                    </div>
                  ))}
                  {recentExams.right.length === 0 && (
                    <p className="text-xs text-muted-foreground">No recent exams</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subject-wise comparison table */}
        {(subjectAverages.left.length > 0 || subjectAverages.right.length > 0) && (
          <div className="bg-card border rounded-lg p-4">
            <h4 className="font-medium mb-3">Subject-wise Averages</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{primary?.name || "-"}</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{compare?.name || "No selection"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {Array.from(new Set([
                    ...subjectAverages.left.map((s) => s.subject),
                    ...subjectAverages.right.map((s) => s.subject),
                  ])).map((sub) => {
                    const l = subjectAverages.left.find((s) => s.subject === sub)?.avg ?? 0
                    const r = subjectAverages.right.find((s) => s.subject === sub)?.avg ?? 0
                    return (
                      <tr key={sub}>
                        <td className="px-4 py-2 text-sm">{sub}</td>
                        <td className="px-4 py-2 text-sm">{l}%</td>
                        <td className="px-4 py-2 text-sm">{r}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
