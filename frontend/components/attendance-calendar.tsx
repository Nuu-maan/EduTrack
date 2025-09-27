"use client"

import * as React from "react"
import { addDays, endOfMonth, format, startOfMonth } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { attendanceAPI, studentsAPI, type Attendance, type Student } from "@/lib/api"

function useMonthDays(month: Date) {
  const start = startOfMonth(month)
  const end = endOfMonth(month)
  const days: Date[] = []
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d)
  return days
}

export function AttendanceCalendar() {
  const [month, setMonth] = React.useState(new Date())
  const [students, setStudents] = React.useState<Student[]>([])
  const [attendance, setAttendance] = React.useState<Attendance[]>([])
  const [classFilter, setClassFilter] = React.useState<string>("")

  const days = useMonthDays(month)
  const start = format(days[0], "yyyy-MM-dd")
  const end = format(days[days.length - 1], "yyyy-MM-dd")

  React.useEffect(() => {
    const load = async () => {
      const s = await studentsAPI.getStudents()
      setStudents(s)
      const dateList = days.map((d) => format(d, "yyyy-MM-dd"))
      const at = await attendanceAPI.getRangeByDays(dateList)
      setAttendance(at)
    }
    load()
  }, [start, end])

  const classNames = Array.from(new Set(students.map((s) => s.class_name))).sort()
  const visibleStudents = classFilter ? students.filter((s) => s.class_name === classFilter) : students

  const getStatus = (studentId: number, date: string) =>
    attendance.find((a) => a.student_id === studentId && a.date === date)?.status

  const setOne = async (studentId: number, date: string, status: "Present" | "Absent") => {
    await attendanceAPI.markAttendance({ student_id: studentId, date, status })
    setAttendance((prev) => {
      const idx = prev.findIndex((a) => a.student_id === studentId && a.date === date)
      const next = [...prev]
      if (idx >= 0) next[idx] = { ...next[idx], status }
      else next.push({ attendance_id: Date.now(), student_id: studentId, date, status })
      return next
    })
  }

  const setAllForClass = async (date: string, status: "Present" | "Absent") => {
    if (!classFilter) return
    await attendanceAPI.bulkMarkByClass(classFilter, date, status)
    // Refresh month range quickly
    const dateList = days.map((d) => format(d, "yyyy-MM-dd"))
    const at = await attendanceAPI.getRangeByDays(dateList)
    setAttendance(at)
  }

  return (
    <Card className="bg-card/60">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle className="text-pretty">Attendance Calendar</CardTitle>
          <div className="ml-auto flex items-center gap-2">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              aria-label="Filter by class"
            >
              <option value="">All classes</option>
              {classNames.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={() => setMonth(addDays(month, -30))}>
              Prev
            </Button>
            <Button variant="outline" onClick={() => setMonth(addDays(month, 30))}>
              Next
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Month: {format(month, "MMMM yyyy")}</p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[220px_repeat(7,1fr)] items-center text-sm text-muted-foreground">
            <div className="p-2">Student</div>
            {days.map((d) => (
              <div key={d.toISOString()} className="p-2 text-center">
                {format(d, "dd")}
              </div>
            ))}
          </div>
          {visibleStudents.map((st) => (
            <div key={st.student_id} className="grid grid-cols-[220px_repeat(7,1fr)]">
              <div className="p-2 border-t border-border/50 text-sm">{st.name}</div>
              {days.map((d) => {
                const date = format(d, "yyyy-MM-dd")
                const status = getStatus(st.student_id, date)
                return (
                  <div key={date + st.student_id} className="border-t border-l border-border/40">
                    <div className="flex items-center justify-center gap-1 p-1">
                      <button
                        className={`h-6 w-6 rounded-full text-xs transition ${status === "Present" ? "bg-emerald-500/80 text-emerald-50" : "bg-muted/40 hover:bg-muted"}`}
                        onClick={() => setOne(st.student_id, date, "Present")}
                        aria-label="Mark present"
                      >
                        P
                      </button>
                      <button
                        className={`h-6 w-6 rounded-full text-xs transition ${status === "Absent" ? "bg-red-500/80 text-red-50" : "bg-muted/40 hover:bg-muted"}`}
                        onClick={() => setOne(st.student_id, date, "Absent")}
                        aria-label="Mark absent"
                      >
                        A
                      </button>
                      {null}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">
              Bulk for selected class on {format(new Date(), "yyyy-MM-dd")}:
            </span>
            <Button
              size="sm"
              onClick={() => setAllForClass(format(new Date(), "yyyy-MM-dd"), "Present")}
              variant="secondary"
            >
              All Present
            </Button>
            <Button
              size="sm"
              onClick={() => setAllForClass(format(new Date(), "yyyy-MM-dd"), "Absent")}
              variant="destructive"
            >
              All Absent
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
