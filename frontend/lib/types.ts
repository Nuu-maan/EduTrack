export type ID = string

export type ClassRoom = {
  id: ID
  name: string // e.g., "Grade 7 - A"
}

export type Subject = {
  id: ID
  name: string // e.g., "Mathematics"
  classId: ID
}

export type Term = {
  id: ID
  name: string // e.g., "Term 1"
  order: number
  startDate: string
  endDate: string
}

export type GradeWeights = {
  assignments: number
  quizzes: number
  exams: number
}

export type GradeBoundaries = {
  A: number
  B: number
  C: number
  D: number
  F: number
}

export type GradeScheme = {
  id: ID
  name: string
  weights: GradeWeights
  boundaries: GradeBoundaries
  passMark: number
}

export type Student = {
  id: ID
  firstName: string
  lastName: string
  email?: string
  classId: ID
  createdAt: string
}

export type Assessment = {
  id: ID
  title: string
  subjectId: ID
  termId: ID
  type: keyof GradeWeights
  maxScore: number
  dueDate: string
}

export type Mark = {
  id: ID
  studentId: ID
  assessmentId: ID
  score: number
  comment?: string
  createdAt: string
}

export type AttendanceStatus = "present" | "absent" | "late"
export type AttendanceRecord = {
  id: ID
  studentId: ID
  date: string // yyyy-mm-dd
  status: AttendanceStatus
  reason?: string
  createdAt: string
}

export type AppData = {
  classes: ClassRoom[]
  subjects: Subject[]
  terms: Term[]
  gradeSchemes: GradeScheme[]
  students: Student[]
  assessments: Assessment[]
  marks: Mark[]
  attendance: AttendanceRecord[]
}
