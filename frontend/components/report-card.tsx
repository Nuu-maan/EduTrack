"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAssessments, useMarks, useSchemes, useSubjects, useTerms } from "@/lib/api"
import type { Student } from "@/lib/types"
import { computeSubjectAverageForStudent, toLetterGrade } from "@/lib/grades"

export function ReportCard({ student }: { student: Student }) {
  const { data: assessments } = useAssessments()
  const { data: marks } = useMarks()
  const { data: subjects } = useSubjects()
  const { data: terms } = useTerms()
  const { data: schemes } = useSchemes()
  const scheme = schemes?.[0]
  const term = terms?.[0]

  if (!assessments || !marks || !subjects || !scheme || !term) {
    return <div className="text-sm text-muted-foreground">Loading...</div>
  }

  const subs = subjects.filter((s) => s.classId === student.classId)

  const lines = subs.map((sub) => {
    const avg = computeSubjectAverageForStudent(student.id, sub, term, assessments, marks, scheme)
    const letter = toLetterGrade(avg, scheme)
    return { subject: sub.name, average: Math.round(avg), letter }
  })

  return (
    <Card className="bg-card/60 print:bg-white print:shadow-none print:border-none">
      <CardHeader>
        <CardTitle>
          Report Card - {student.firstName} {student.lastName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          Term: {term.name} | Scheme: {scheme.name}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lines.map((l) => (
            <div
              key={l.subject}
              className="flex items-center justify-between rounded-md border border-border/50 bg-background/50 px-3 py-2"
            >
              <span className="text-sm">{l.subject}</span>
              <span className="text-sm font-medium">
                {l.average}% ({l.letter})
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground transition hover:opacity-90"
          >
            Print / Save PDF
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
