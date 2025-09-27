"use client"

import type React from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { Users, Calendar, BookOpen, BarChart3, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { CommandMenu } from "@/components/command-menu"

const navigation = [
  { name: "Students", href: "/students", icon: Users },
  { name: "Attendance", href: "/attendance", icon: Calendar },
  { name: "Marks", href: "/marks", icon: BookOpen },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Leaderboard", href: "/leaderboard", icon: BarChart3 },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  // Wait for auth check before deciding
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  // Redirect unauthenticated users to /login
  if (!user) {
    if (typeof window !== "undefined" && pathname !== "/login") {
      router.replace("/login")
    }
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-card border-r border-border shadow-lg">
          <div className="flex h-16 items-center justify-between px-4 border-b border-border/60">
            <h1 className="text-xl font-bold">EduTrack</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-sidebar border-r border-sidebar-border">
          <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border/60">
            <h1 className="text-xl font-bold">EduTrack</h1>
            <div className="flex items-center gap-2">
              <CommandMenu />
              <ThemeToggle />
            </div>
          </div>
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
          <div className="border-t border-border p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user.username}</p>
                <button
                  onClick={logout}
                  className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="mr-1 h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex h-16 bg-card border-b border-border lg:hidden items-center">
          <button onClick={() => setSidebarOpen(true)} className="px-4 text-muted-foreground hover:text-foreground">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 items-center justify-between pr-4">
            <h1 className="text-lg font-semibold">EduTrack</h1>
            <div className="flex items-center gap-2">
              <CommandMenu />
            </div>
          </div>
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
