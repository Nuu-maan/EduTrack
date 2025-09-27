"use client"

import { useEffect, useMemo, useState } from "react"
import Layout from "@/components/Layout"
import { useAuth } from "@/contexts/AuthContext"
import { reportsAPI, type AttendanceRankRow, type MarksRankRow, type OverviewRow } from "@/lib/api"
import { BarChart3, Filter } from "lucide-react"

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth()

  const [view, setView] = useState<"attendance" | "marks" | "overall">("attendance")
  const [className, setClassName] = useState<string>("")
  const [subject, setSubject] = useState<string>("")

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")

  const [attData, setAttData] = useState<AttendanceRankRow[]>([])
  const [marksData, setMarksData] = useState<MarksRankRow[]>([])
  const [overviewData, setOverviewData] = useState<OverviewRow[]>([])

  useEffect(() => {
    if (authLoading || !user) return
    void fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, view, className, subject])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")
      if (view === "attendance") {
        const res = await reportsAPI.rankAttendance({ class_name: className || undefined })
        setAttData(res.students)
      } else if (view === "marks") {
        const res = await reportsAPI.rankMarks({ class_name: className || undefined, subject: subject || undefined })
        setMarksData(res.students)
      } else {
        const res = await reportsAPI.getOverview({ class_name: className || undefined })
        setOverviewData(res.students)
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load leaderboard")
    } finally {
      setLoading(false)
    }
  }

  const header = useMemo(() => {
    if (view === "attendance") return "Attendance Leaderboard"
    if (view === "marks") return "Marks Leaderboard"
    return "Overall Leaderboard"
  }, [view])

  if (authLoading || !user) {
    return null
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{header}</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 rounded-md border p-4 bg-card">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col">
              <label className="text-sm text-muted-foreground">View</label>
              <select
                value={view}
                onChange={(e) => setView(e.target.value as any)}
                className="mt-1 px-3 py-2 border border-input rounded-md"
              >
                <option value="attendance">Attendance</option>
                <option value="marks">Marks</option>
                <option value="overall">Overall</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-muted-foreground">Class</label>
              <input
                type="text"
                placeholder="e.g., 10A"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="mt-1 px-3 py-2 border border-input rounded-md"
              />
            </div>

            {view === "marks" && (
              <div className="flex flex-col">
                <label className="text-sm text-muted-foreground">Subject</label>
                <input
                  type="text"
                  placeholder="e.g., Math"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 px-3 py-2 border border-input rounded-md"
                />
              </div>
            )}

            <button
              onClick={() => fetchData()}
              className="ml-auto px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
            >
              <Filter className="h-4 w-4" /> Apply
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm">{error}</div>
        ) : view === "attendance" ? (
          <div className="bg-card border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Attendance %</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {attData.map((row, idx) => (
                  <tr key={row.student_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{idx + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{row.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{row.class_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{row.attendance_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : view === "marks" ? (
          <div className="bg-card border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Average Marks</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {marksData.map((row, idx) => (
                  <tr key={row.student_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{idx + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{row.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{row.class_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{row.avg_marks.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-card border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Attendance %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Average Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Att. Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Marks Rank</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {overviewData
                  .slice()
                  .sort((a, b) => (a.rank_attendance + a.rank_marks) - (b.rank_attendance + b.rank_marks))
                  .map((row, idx) => (
                    <tr key={row.student_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{idx + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{row.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{row.class_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{row.attendance_pct}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{row.avg_marks.toFixed(2)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{row.rank_attendance}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{row.rank_marks}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
