"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <>
      <button
        aria-label="Open command menu"
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex items-center rounded-md border border-border/60 bg-card/30 backdrop-blur-md px-3 py-1.5 text-sm text-muted-foreground shadow-sm hover:bg-card/50 transition"
      >
        ⌘K Search
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigate">
            <CommandItem onSelect={() => router.push("/")}>Dashboard</CommandItem>
            <CommandItem onSelect={() => router.push("/students")}>Students</CommandItem>
            <CommandItem onSelect={() => router.push("/attendance")}>Attendance</CommandItem>
            <CommandItem onSelect={() => router.push("/attendance/calendar")}>Attendance Calendar</CommandItem>
            <CommandItem onSelect={() => router.push("/marks")}>Marks</CommandItem>
            <CommandItem onSelect={() => router.push("/reports")}>Reports</CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => router.push("/attendance")}>Take attendance today</CommandItem>
            <CommandItem onSelect={() => router.push("/marks")}>Enter latest marks</CommandItem>
            <CommandItem onSelect={() => router.push("/login")}>Switch account</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
