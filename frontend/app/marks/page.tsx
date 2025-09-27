"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import Layout from "@/components/Layout"
import { marksAPI, studentsAPI, type Student, type Marks } from "@/lib/api"
import { Plus, Edit } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export default function MarksPage() {
  const { user, loading: authLoading } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [marks, setMarks] = useState<Marks[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMark, setEditingMark] = useState<Marks | null>(null)
  const [formData, setFormData] = useState({
    student_id: "",
    subject: "",
    exam_name: "",
    marks_obtained: "",
    total_marks: "",
  })

  useEffect(() => {
    if (!authLoading && user) {
      fetchStudents()
      fetchMarks()
    }
  }, [authLoading, user])

  const fetchStudents = async () => {
    try {
      const data = await studentsAPI.getStudents()
      setStudents(data)
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const fetchMarks = async () => {
    try {
      const all = await marksAPI.getAllMarks()
      setMarks(all)
    } catch (error) {
      console.error("Error fetching marks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingMark) {
        // Update existing mark
        await marksAPI.addMarks({
          ...formData,
          student_id: Number.parseInt(formData.student_id),
          marks_obtained: Number.parseInt(formData.marks_obtained),
          total_marks: Number.parseInt(formData.total_marks),
        })
      } else {
        // Add new mark
        await marksAPI.addMarks({
          ...formData,
          student_id: Number.parseInt(formData.student_id),
          marks_obtained: Number.parseInt(formData.marks_obtained),
          total_marks: Number.parseInt(formData.total_marks),
        })
      }
      setShowModal(false)
      setEditingMark(null)
      setFormData({ student_id: "", subject: "", exam_name: "", marks_obtained: "", total_marks: "" })
      fetchMarks()
    } catch (error) {
      console.error("Error saving marks:", error)
    }
  }

  const handleEdit = (mark: Marks) => {
    setEditingMark(mark)
    setFormData({
      student_id: mark.student_id.toString(),
      subject: mark.subject,
      exam_name: mark.exam_name,
      marks_obtained: mark.marks_obtained.toString(),
      total_marks: mark.total_marks.toString(),
    })
    setShowModal(true)
  }

  const getStudentName = (studentId: number) => {
    const student = students.find((s) => s.student_id === studentId)
    return student ? student.name : "Unknown"
  }

  const getPercentage = (obtained: number, total: number) => {
    return total > 0 ? Math.round((obtained / total) * 100) : 0
  }

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return "A+"
    if (percentage >= 80) return "A"
    if (percentage >= 70) return "B"
    if (percentage >= 60) return "C"
    if (percentage >= 50) return "D"
    return "F"
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Marks</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Marks
          </button>
        </div>

        {/* Marks Table */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Exam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {marks.map((mark) => {
                const percentage = getPercentage(mark.marks_obtained, mark.total_marks)
                const grade = getGrade(percentage)
                return (
                  <tr key={mark.marks_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {getStudentName(mark.student_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{mark.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{mark.exam_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {mark.marks_obtained}/{mark.total_marks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{percentage}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          grade === "A+" || grade === "A"
                            ? "bg-green-100 text-green-800"
                            : grade === "B"
                              ? "bg-blue-100 text-blue-800"
                              : grade === "C"
                                ? "bg-yellow-100 text-yellow-800"
                                : grade === "D"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-red-100 text-red-800"
                        }`}
                      >
                        {grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleEdit(mark)} className="text-primary hover:text-primary/90 mr-4">
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-card">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-foreground mb-4">
                  {editingMark ? "Edit Marks" : "Add New Marks"}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">Student</label>
                    <Select
                      value={formData.student_id}
                      onValueChange={(v) => setFormData({ ...formData, student_id: v })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.student_id} value={String(student.student_id)}>
                            {student.name} - {student.class_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">Exam Name</label>
                    <input
                      type="text"
                      required
                      value={formData.exam_name}
                      onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">Marks Obtained</label>
                    <input
                      type="number"
                      required
                      value={formData.marks_obtained}
                      onChange={(e) => setFormData({ ...formData, marks_obtained: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-foreground mb-2">Total Marks</label>
                    <input
                      type="number"
                      required
                      value={formData.total_marks}
                      onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        setEditingMark(null)
                        setFormData({ student_id: "", subject: "", exam_name: "", marks_obtained: "", total_marks: "" })
                      }}
                      className="px-4 py-2 text-sm font-medium text-secondary-foreground bg-secondary rounded-md hover:bg-secondary/80"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90"
                    >
                      {editingMark ? "Update" : "Add"} Marks
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
