import type { Assessment, GradeScheme, Mark, Subject, Term } from "./types"

export function computeSubjectAverageForStudent(
  studentId: string,
  subject: Subject,
  term: Term,
  assessments: Assessment[],
  marks: Mark[],
  scheme: GradeScheme,
) {
  const relevantAssessments = assessments.filter((a) => a.subjectId === subject.id && a.termId === term.id)
  if (!relevantAssessments.length) return 0

  let total = 0
  let weightSum = 0

  for (const a of relevantAssessments) {
    const m = marks.find((mm) => mm.studentId === studentId && mm.assessmentId === a.id)
    if (!m) continue
    const pct = (m.score / a.maxScore) * 100
    const w = scheme.weights[a.type]
    total += pct * w
    weightSum += w
  }

  if (weightSum === 0) return 0
  return total / weightSum
}

export function toLetterGrade(score: number, scheme: GradeScheme) {
  if (score >= scheme.boundaries.A) return "A"
  if (score >= scheme.boundaries.B) return "B"
  if (score >= scheme.boundaries.C) return "C"
  if (score >= scheme.boundaries.D) return "D"
  return "F"
}
