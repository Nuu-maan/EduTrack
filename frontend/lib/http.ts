"use client"

import axios from "axios"

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const http = axios.create({
  baseURL,
})

// Token management
const TOKEN_KEY = "edutrack_token"

export function getToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

// Attach Authorization header if token exists
http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers["Authorization"] = `Bearer ${token}`
  }
  return config
})

// Basic response error normalization
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status
    const message = err?.response?.data?.detail || err?.message || "Request failed"
    if (typeof window !== "undefined" && status === 401) {
      try {
        localStorage.removeItem("edutrack_token")
        localStorage.removeItem("edutrack_user")
      } catch {}
      // Force re-authentication
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(new Error(message))
  },
)
