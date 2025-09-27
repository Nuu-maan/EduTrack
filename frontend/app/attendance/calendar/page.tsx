"use client"

import Layout from "@/components/Layout"
import { AttendanceCalendar } from "@/components/attendance-calendar"

export default function AttendanceCalendarPage() {
  return (
    <Layout>
      <main className="p-6">
        <AttendanceCalendar />
      </main>
    </Layout>
  )
}
