"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { authAPI } from "@/lib/api"
import { setToken } from "@/lib/http"

type User = { username: string }
type AuthContextType = {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // On mount, try fetching current user with existing token
    ;(async () => {
      try {
        const me = await authAPI.me()
        setUser({ username: me.username })
        localStorage.setItem("edutrack_user", JSON.stringify({ username: me.username }))
      } catch {
        // fallback to cached user if present (e.g., first render before token available)
        const cached = typeof window !== "undefined" ? localStorage.getItem("edutrack_user") : null
        if (cached) {
          try {
            setUser(JSON.parse(cached))
          } catch {}
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const persist = (u: User | null) => {
    if (u) localStorage.setItem("edutrack_user", JSON.stringify(u))
    else localStorage.removeItem("edutrack_user")
  }

  const login = async (username: string, password: string) => {
    const token = await authAPI.login(username, password)
    setToken(token.access_token)
    const me = await authAPI.me()
    const u = { username: me.username }
    setUser(u)
    persist(u)
  }

  const register = async (username: string, password: string) => {
    await authAPI.register(username, password)
    // Auto-login after register
    const token = await authAPI.login(username, password)
    setToken(token.access_token)
    const me = await authAPI.me()
    const u = { username: me.username }
    setUser(u)
    persist(u)
  }

  const logout = () => {
    setUser(null)
    persist(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
