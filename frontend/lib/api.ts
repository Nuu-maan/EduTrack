"use client"

import { http } from "./http"

export type Student = {
  student_id: number
  name: string
  class_name: string
  roll_no: number
}

export type Attendance = {
  attendance_id: number
  student_id: number
  date: string // YYYY-MM-DD
  status: "Present" | "Absent"
}

export type Marks = {
  marks_id: number
  student_id: number
  subject: string
  exam_name: string
  marks_obtained: number
  total_marks: number
}

export type StudentReport = {
  student: Student
  attendance_summary: Record<string, any>
  marks_summary: Marks[]
  attendance_percentage?: number
}

export type Recommendation = {
  student_id: number
  name: string
  class_name: string
  reasons: { type: "attendance" | "marks"; value: number; threshold: number }[]
}

export type AttendanceRankRow = { student_id: number; name: string; class_name: string; attendance_pct: number }
export type MarksRankRow = { student_id: number; name: string; class_name: string; avg_marks: number }
export type OverviewRow = AttendanceRankRow & { avg_marks: number; rank_attendance: number; rank_marks: number }

// Auth API
export const authAPI = {
  async register(username: string, password: string) {
    const res = await http.post("/auth/register", { username, password })
    return res.data as { id: number; username: string }
  },
  async login(username: string, password: string) {
    const res = await http.post("/auth/login", { username, password })
    return res.data as { access_token: string; token_type: string }
  },
  async me() {
    const res = await http.get("/auth/me")
    return res.data as { id: number; username: string }
  },
}

// Students API
export const studentsAPI = {
  async getStudents(): Promise<Student[]> {
    const res = await http.get("/students/")
    return res.data
  },
  async createStudent(data: { name: string; class_name: string; roll_no: number }): Promise<Student> {
    const res = await http.post("/students/", data)
    return res.data
  },
  async updateStudent(id: number, data: { name?: string; class_name?: string; roll_no?: number }): Promise<Student> {
    const res = await http.put(`/students/${id}` , data)
    return res.data
  },
  async deleteStudent(id: number): Promise<void> {
    await http.delete(`/students/${id}`)
  },
}

// Attendance API
export const attendanceAPI = {
  async getAttendanceByDate(date: string): Promise<Attendance[]> {
    const res = await http.get(`/attendance/date/${date}`)
    return res.data
  },
  // Convenience: fetch multiple dates and flatten
  async getRangeByDays(days: string[]): Promise<Attendance[]> {
    const results = await Promise.all(days.map((d) => attendanceAPI.getAttendanceByDate(d)))
    return results.flat()
  },
  async markAttendance(data: { student_id: number; date: string; status: "Present" | "Absent" }): Promise<Attendance> {
    const res = await http.post(`/attendance/`, data)
    return res.data
  },
  async bulkMarkByClass(class_name: string, date: string, status: "Present" | "Absent"): Promise<void> {
    const students = await studentsAPI.getStudents()
    const target = students.filter((s) => s.class_name === class_name)
    if (target.length === 0) return
    const payload = target.map((s) => ({ student_id: s.student_id, date, status }))
    await http.post(`/attendance/bulk`, payload)
  },
  async getCalendarSummary(student_id: number, start: string, end: string): Promise<Record<string, string>> {
    const res = await http.get(`/attendance/summary/calendar`, { params: { student_id, start, end } })
    return res.data
  },
  async getClassSummary(class_name: string, start: string, end: string): Promise<{ class_name: string; days: { date: string; present: number; absent: number; total: number }[] }> {
    const res = await http.get(`/attendance/summary/class`, { params: { class_name, start, end } })
    return res.data
  },
}

// Marks API
export const marksAPI = {
  async getStudentMarks(student_id: number): Promise<Marks[]> {
    const res = await http.get(`/marks/student/${student_id}`)
    return res.data
  },
  async addMarks(data: {
    student_id: number
    subject: string
    exam_name: string
    marks_obtained: number
    total_marks: number
  }): Promise<Marks> {
    const res = await http.post(`/marks/`, data)
    return res.data
  },
  async getAllMarks(): Promise<Marks[]> {
    const students = await studentsAPI.getStudents()
    if (students.length === 0) return []
    const results = await Promise.all(students.map((s) => marksAPI.getStudentMarks(s.student_id)))
    return results.flat()
  },
}

// Reports API
export const reportsAPI = {
  async getStudentReport(student_id: number): Promise<StudentReport> {
    const res = await http.get(`/reports/student/${student_id}`)
    return res.data
  },
  async getRecommendations(params: { class_name?: string; window_days?: number; attendance_threshold?: number; marks_threshold?: number } = {}): Promise<{ window_days: number; count: number; recommendations: Recommendation[] }> {
    const res = await http.get(`/reports/recommendations`, { params })
    return res.data
  },
  async rankAttendance(params: { class_name?: string; window_days?: number } = {}): Promise<{ total: number; students: AttendanceRankRow[] }> {
    const res = await http.get(`/reports/rank/attendance`, { params })
    return res.data
  },
  async rankMarks(params: { class_name?: string; subject?: string } = {}): Promise<{ total: number; students: MarksRankRow[] }> {
    const res = await http.get(`/reports/rank/marks`, { params })
    return res.data
  },
  async getOverview(params: { class_name?: string } = {}): Promise<{ total: number; students: OverviewRow[] }> {
    const res = await http.get(`/reports/overview`, { params })
    return res.data
  },
}
