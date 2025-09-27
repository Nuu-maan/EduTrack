import type {
  AppData,
  ClassRoom,
  Subject,
  Term,
  GradeScheme,
  Student,
  Assessment,
  Mark,
  AttendanceRecord,
} from "./types"

const STORAGE_KEY = "edutrack:data:v1"

function nowISO() {
  return new Date().toISOString()
}

export function loadDB(): AppData {
  if (typeof window === "undefined") {
    // SSR-safe default
    return emptyDB()
  }
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seeded = seedDB()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
    return seeded
  }
  try {
    return JSON.parse(raw) as AppData
  } catch {
    const seeded = seedDB()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
    return seeded
  }
}

export function saveDB(data: AppData) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function emptyDB(): AppData {
  return {
    classes: [],
    subjects: [],
    terms: [],
    gradeSchemes: [],
    students: [],
    assessments: [],
    marks: [],
    attendance: [],
  }
}

function id() {
  return crypto.randomUUID()
}

export function seedDB(): AppData {
  const class7A: ClassRoom = { id: id(), name: "Grade 7 - A" }
  const class7B: ClassRoom = { id: id(), name: "Grade 7 - B" }

  const mathA: Subject = { id: id(), name: "Mathematics", classId: class7A.id }
  const engA: Subject = { id: id(), name: "English", classId: class7A.id }
  const sciA: Subject = { id: id(), name: "Science", classId: class7A.id }

  const term1: Term = {
    id: id(),
    name: "Term 1",
    order: 1,
    startDate: new Date(new Date().getFullYear(), 0, 10).toISOString(),
    endDate: new Date(new Date().getFullYear(), 3, 5).toISOString(),
  }
  const term2: Term = {
    id: id(),
    name: "Term 2",
    order: 2,
    startDate: new Date(new Date().getFullYear(), 3, 10).toISOString(),
    endDate: new Date(new Date().getFullYear(), 6, 30).toISOString(),
  }

  const scheme: GradeScheme = {
    id: id(),
    name: "Default Scheme",
    weights: { assignments: 0.3, quizzes: 0.2, exams: 0.5 },
    boundaries: { A: 90, B: 80, C: 70, D: 60, F: 0 },
    passMark: 50,
  }

  const students: Student[] = [
    {
      id: id(),
      firstName: "Aarav",
      lastName: "Sharma",
      email: "aarav@example.com",
      classId: class7A.id,
      createdAt: nowISO(),
    },
    {
      id: id(),
      firstName: "Diya",
      lastName: "Patel",
      email: "diya@example.com",
      classId: class7A.id,
      createdAt: nowISO(),
    },
    {
      id: id(),
      firstName: "Kabir",
      lastName: "Singh",
      email: "kabir@example.com",
      classId: class7A.id,
      createdAt: nowISO(),
    },
    {
      id: id(),
      firstName: "Emma",
      lastName: "Wilson",
      email: "emma@example.com",
      classId: class7B.id,
      createdAt: nowISO(),
    },
  ]

  const assessments: Assessment[] = [
    {
      id: id(),
      title: "Algebra Quiz 1",
      subjectId: mathA.id,
      termId: term1.id,
      type: "quizzes",
      maxScore: 20,
      dueDate: nowISO(),
    },
    {
      id: id(),
      title: "English Essay",
      subjectId: engA.id,
      termId: term1.id,
      type: "assignments",
      maxScore: 50,
      dueDate: nowISO(),
    },
    {
      id: id(),
      title: "Science Midterm",
      subjectId: sciA.id,
      termId: term1.id,
      type: "exams",
      maxScore: 100,
      dueDate: nowISO(),
    },
  ]

  const marks: Mark[] = []
  for (const s of students.filter((st) => st.classId === class7A.id)) {
    marks.push(
      {
        id: id(),
        studentId: s.id,
        assessmentId: assessments[0].id,
        score: Math.floor(10 + Math.random() * 10),
        createdAt: nowISO(),
      },
      {
        id: id(),
        studentId: s.id,
        assessmentId: assessments[1].id,
        score: Math.floor(30 + Math.random() * 20),
        createdAt: nowISO(),
      },
      {
        id: id(),
        studentId: s.id,
        assessmentId: assessments[2].id,
        score: Math.floor(60 + Math.random() * 40),
        createdAt: nowISO(),
      },
    )
  }

  const attendance: AttendanceRecord[] = []
  const today = new Date()
  students.forEach((s) => {
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      attendance.push({
        id: id(),
        studentId: s.id,
        date: d.toISOString().slice(0, 10),
        status: Math.random() < 0.9 ? "present" : Math.random() < 0.5 ? "absent" : "late",
        createdAt: nowISO(),
      })
    }
  })

  return {
    classes: [class7A, class7B],
    subjects: [mathA, engA, sciA],
    terms: [term1, term2],
    gradeSchemes: [scheme],
    students,
    assessments,
    marks,
    attendance,
  }
}
