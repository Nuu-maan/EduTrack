"use client"

import React from "react"

type Props = {
  data: Record<string, string> // ISO date -> status string (Present/Absent)
  start: string // YYYY-MM-DD
  end: string // YYYY-MM-DD
}

function rangeDates(start: Date, end: Date): Date[] {
  const out: Date[] = []
  const d = new Date(start)
  while (d <= end) {
    out.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return out
}

function colorFor(status?: string): string {
  if (!status) return "bg-muted"
  if (status === "Present") return "bg-green-500/70"
  if (status === "Absent") return "bg-red-500/70"
  return "bg-muted"
}

export function AttendanceHeatmap({ data, start, end }: Props) {
  const s = new Date(start)
  const e = new Date(end)
  const days = rangeDates(s, e)

  return (
    <div>
      <div className="grid grid-cols-14 gap-1">
        {days.map((d) => {
          const key = d.toISOString().slice(0, 10)
          const status = data[key]
          return (
            <div key={key} title={`${key} - ${status || "No data"}`} className={`h-4 w-4 rounded ${colorFor(status)}`} />)
        })}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">Green: Present, Red: Absent, Gray: No data</div>
    </div>
  )
}

export default AttendanceHeatmap
