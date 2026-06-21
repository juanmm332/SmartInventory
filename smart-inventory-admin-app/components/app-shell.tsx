"use client"

import { useEffect, useState } from "react"
import { LoginView } from "@/components/login-view"
import { Dashboard } from "@/components/dashboard"
import { getToken } from "@/lib/auth"

export function AppShell() {
  // null = aún verificando localStorage (evita parpadeo en el primer render).
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    setIsAuthed(!!getToken())
  }, [])

  if (isAuthed === null) return null

  if (!isAuthed) {
    return <LoginView onSuccess={() => setIsAuthed(true)} />
  }

  return <Dashboard onLogout={() => setIsAuthed(false)} />
}
