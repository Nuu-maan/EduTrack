"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/Layout"
import { reportsAPI, studentsAPI, type Student, type StudentReport } from "@/lib/api"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { BarChart3 } from "lucide-react"
import Dropdown from "@/components/Dropdown"

export default function ReportsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [studentReport, setStudentReport] = useState<StudentReport | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const data = await studentsAPI.getStudents()
      setStudents(data)
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const fetchStudentReport = async (studentId: number) => {
    setLoading(true)
    try {
      const report = await reportsAPI.getStudentReport(studentId)
      setStudentReport(report)
    } catch (error) {
      console.error("Error fetching student report:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStudentChange = (studentId: number) => {
    const student = students.find((s) => s.student_id === studentId)
    setSelectedStudent(student || null)
    if (student) {
      fetchStudentReport(studentId)
    }
  }

  const getAttendanceData = () => {
    if (!studentReport) return []

    return [
      { name: "Present", value: studentReport.attendance_summary.present_days, color: "#10B981" },
      { name: "Absent", value: studentReport.attendance_summary.absent_days, color: "#EF4444" },
    ]
  }

  const getMarksData = () => {
    if (!studentReport) return []

    return studentReport.marks_summary.map((mark) => ({
      subject: mark.subject,
      percentage: Math.round((mark.marks_obtained / mark.total_marks) * 100),
      marks: mark.marks_obtained,
      total: mark.total_marks,
    }))
  }

  const getSubjectPerformance = () => {
    if (!studentReport) return []

    const subjectMap = new Map<string, number[]>()
    studentReport.marks_summary.forEach((mark) => {
      const subject = mark.subject
      const percentage = (mark.marks_obtained / mark.total_marks) * 100

      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, [])
      }
      const arr = subjectMap.get(subject) as number[]
      arr.push(percentage)
    })

    return Array.from(subjectMap.entries()).map(([subject, percentages]) => ({
      subject,
      average: Math.round((percentages as number[]).reduce((a: number, b: number) => a + b, 0) / (percentages as number[]).length),
    }))
  }

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate and view student performance reports</p>
        </div>

        {/* Student Selection */}
        <div className="bg-card rounded-lg border p-6 mb-6">
          <h2 className="text-lg font-medium text-foreground mb-4">Select Student</h2>
          <div className="w-full max-w-md">
            <Dropdown
              value={selectedStudent?.student_id ? String(selectedStudent.student_id) : ""}
              onChange={(v) => handleStudentChange(Number.parseInt(v))}
              placeholder="Select a student to view report"
              options={students.map((s) => ({ label: `${s.name} - ${s.class_name} (Roll: ${s.roll_no})`, value: String(s.student_id) }))}
            />
          </div>
        </div>

        {selectedStudent && studentReport && (
          <div className="space-y-6">
            {/* Student Info */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-lg font-medium text-foreground mb-4">Student Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-lg text-foreground">{studentReport.student.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Class</p>
                  <p className="text-lg text-foreground">{studentReport.student.class_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Roll Number</p>
                  <p className="text-lg text-foreground">{studentReport.student.roll_no}</p>
                </div>
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-lg font-medium text-foreground mb-4">Attendance Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{studentReport.attendance_summary.present_days}</p>
                      <p className="text-sm text-muted-foreground">Present Days</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{studentReport.attendance_summary.absent_days}</p>
                      <p className="text-sm text-muted-foreground">Absent Days</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {studentReport.attendance_summary.attendance_percentage}%
                    </p>
                    <p className="text-sm text-muted-foreground">Attendance Percentage</p>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getAttendanceData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getAttendanceData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Marks Summary */}
            {studentReport.marks_summary.length > 0 && (
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-lg font-medium text-foreground mb-4">Marks Summary</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-medium text-muted-foreground mb-4">Subject-wise Performance</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getSubjectPerformance()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="subject" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="average" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-muted-foreground mb-4">Recent Exam Results</h3>
                    <div className="space-y-2">
                      {getMarksData()
                        .slice(0, 5)
                        .map((mark, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-md">
                            <div>
                              <p className="font-medium text-foreground">{mark.subject}</p>
                              <p className="text-sm text-muted-foreground">
                                {mark.marks}/{mark.total} marks
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">{mark.percentage}%</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Trends */}
            {studentReport.marks_summary.length > 1 && (
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-lg font-medium text-foreground mb-4">Performance Trends</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getMarksData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="percentage" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedStudent && !studentReport && !loading && (
          <div className="bg-card rounded-lg border p-6 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No data available for this student</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
