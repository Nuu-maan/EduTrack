"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/Layout"
import { attendanceAPI, studentsAPI, type Student, type Attendance } from "@/lib/api"
import AttendanceHeatmap from "@/components/AttendanceHeatmap"
import { Calendar, Check, X, Plus } from "lucide-react"
import Dropdown from "@/components/Dropdown"
import { format, subDays } from "date-fns"

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(true)
  const [recentDays, setRecentDays] = useState<{ date: string; count: number }[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [attendanceStatus, setAttendanceStatus] = useState<"Present" | "Absent">("Present")
  const [heatmapStudentId, setHeatmapStudentId] = useState<number | "">("")
  const [heatmapData, setHeatmapData] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchStudents()
    fetchAttendance()
    fetchRecent()
    fetchHeatmap()
  }, [selectedDate])

  const fetchStudents = async () => {
    try {
      const data = await studentsAPI.getStudents()
      setStudents(data)
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const fetchHeatmap = async () => {
    try {
      const sid = heatmapStudentId || (students.length > 0 ? students[0].student_id : null)
      if (!sid) return
      const end = new Date(selectedDate)
      const start = new Date(end)
      start.setDate(end.getDate() - 29)
      const startStr = start.toISOString().slice(0, 10)
      const endStr = end.toISOString().slice(0, 10)
      const data = await attendanceAPI.getCalendarSummary(sid, startStr, endStr)
      setHeatmapData(data)
      if (!heatmapStudentId) setHeatmapStudentId(sid)
    } catch {
      // silent fail for optional panel
    }
  }

  const fetchAttendance = async () => {
    try {
      const data = await attendanceAPI.getAttendanceByDate(selectedDate)
      setAttendance(data)
    } catch (error) {
      console.error("Error fetching attendance:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecent = async () => {
    try {
      // Build last 14 days list including today, then summarize
      const days: string[] = []
      for (let i = 0; i < 14; i++) {
        const d = subDays(new Date(selectedDate), i)
        days.push(format(d, "yyyy-MM-dd"))
      }
      const results = await Promise.all(days.map((d) => attendanceAPI.getAttendanceByDate(d)))
      const summary = days.map((d, idx) => ({ date: d, count: results[idx].length }))
      setRecentDays(summary)
    } catch (e) {
      // ignore
    }
  }

  const handleMarkAttendance = async (studentId: number, status: "Present" | "Absent") => {
    try {
      await attendanceAPI.markAttendance({
        student_id: studentId,
        date: selectedDate,
        status,
      })
      fetchAttendance()
    } catch (error) {
      console.error("Error marking attendance:", error)
    }
  }

  const handleMarkAll = async (status: "Present" | "Absent") => {
    try {
      await Promise.all(
        students.map((s) =>
          attendanceAPI.markAttendance({ student_id: s.student_id, date: selectedDate, status }),
        ),
      )
      fetchAttendance()
    } catch (error) {
      console.error("Error bulk marking attendance:", error)
    }
  }

  const getStudentAttendance = (studentId: number) => {
    return attendance.find((a) => a.student_id === studentId)
  }

  const getAttendanceStats = () => {
    const totalStudents = students.length
    const presentCount = attendance.filter((a) => a.status === "Present").length
    const absentCount = attendance.filter((a) => a.status === "Absent").length
    const markedCount = presentCount + absentCount
    const unmarkedCount = totalStudents - markedCount

    return { totalStudents, presentCount, absentCount, markedCount, unmarkedCount }
  }

  const stats = getAttendanceStats()

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

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            />
            {/* Quick bulk actions for selected date */}
            <button
              onClick={() => handleMarkAll("Present")}
              className="px-3 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm font-medium"
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll("Absent")}
              className="px-3 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm font-medium"
            >
              Mark All Absent
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Mark Attendance
            </button>
          </div>
        </div>

        {/* CTA if no attendance yet for today */}
        {selectedDate === new Date().toISOString().split("T")[0] && attendance.length === 0 && (
          <div className="mb-6 rounded-md border p-4 bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  No attendance recorded for today. Quickly take today’s attendance.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleMarkAll("Present")}
                  className="px-3 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm font-medium"
                >
                  All Present
                </button>
                <button
                  onClick={() => handleMarkAll("Absent")}
                  className="px-3 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm font-medium"
                >
                  All Absent
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-semibold text-foreground">{stats.totalStudents}</p>
              </div>
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Present</p>
                <p className="text-2xl font-semibold text-foreground">{stats.presentCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-full">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Absent</p>
                <p className="text-2xl font-semibold text-foreground">{stats.absentCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Unmarked</p>
                <p className="text-2xl font-semibold text-foreground">{stats.unmarkedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 30-day Heatmap */}
        <div className="mb-6 rounded-md border p-4 bg-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-foreground">30-day Attendance Heatmap</h3>
            <Dropdown
              value={heatmapStudentId ? String(heatmapStudentId) : ""}
              onChange={(v) => setHeatmapStudentId(v ? Number.parseInt(v) : "")}
              placeholder="Select student"
              options={[{ label: "Select student", value: "", disabled: true }, ...students.map((s) => ({ label: `${s.name} - ${s.class_name}` , value: String(s.student_id) }))]}
            />
          </div>
          {(() => {
            const end = new Date(selectedDate)
            const start = new Date(end)
            start.setDate(end.getDate() - 29)
            const startStr = start.toISOString().slice(0, 10)
            const endStr = end.toISOString().slice(0, 10)
            return <AttendanceHeatmap data={heatmapData} start={startStr} end={endStr} />
          })()}
        </div>

        {/* Students List */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-medium text-foreground">
              Students - {new Date(selectedDate).toLocaleDateString()}
            </h2>
          </div>
          <div className="divide-y divide-border">
            {students.map((student) => {
              const studentAttendance = getStudentAttendance(student.student_id)
              return (
                <div key={student.student_id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-foreground">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.class_name} - Roll No: {student.roll_no}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {studentAttendance ? (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          studentAttendance.status === "Present"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {studentAttendance.status}
                      </span>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleMarkAttendance(student.student_id, "Present")}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm font-medium"
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleMarkAttendance(student.student_id, "Absent")}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm font-medium"
                        >
                          Absent
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-card">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-foreground mb-4">Mark Attendance</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">Select Student</label>
                  <Dropdown
                    value={selectedStudent?.student_id ? String(selectedStudent.student_id) : ""}
                    onChange={(v) => {
                      const student = students.find((s) => s.student_id === Number.parseInt(v))
                      setSelectedStudent(student || null)
                    }}
                    placeholder="Select a student"
                    className="w-full"
                    options={[{ label: "Select a student", value: "", disabled: true }, ...students.map((s) => ({ label: `${s.name} - ${s.class_name}`, value: String(s.student_id) }))]}
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="Present"
                        checked={attendanceStatus === "Present"}
                        onChange={(e) => setAttendanceStatus(e.target.value as "Present" | "Absent")}
                        className="mr-2"
                      />
                      Present
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="Absent"
                        checked={attendanceStatus === "Absent"}
                        onChange={(e) => setAttendanceStatus(e.target.value as "Present" | "Absent")}
                        className="mr-2"
                      />
                      Absent
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-secondary-foreground bg-secondary rounded-md hover:bg-secondary/80"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (selectedStudent) {
                        handleMarkAttendance(selectedStudent.student_id, attendanceStatus)
                        setShowModal(false)
                        setSelectedStudent(null)
                        setAttendanceStatus("Present")
                      }
                    }}
                    disabled={!selectedStudent}
                    className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
                  >
                    Mark Attendance
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-3">Past Attendance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentDays
              .filter((d) => d.date !== selectedDate && d.count > 0)
              .map((d) => (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-accent text-left"
                >
                  <span className="text-sm">{new Date(d.date).toLocaleDateString()}</span>
                  <span className="text-xs text-muted-foreground">{d.count} marked</span>
                </button>
              ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
