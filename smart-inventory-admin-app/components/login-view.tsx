"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AUTH_LOGIN_ENDPOINT } from "@/lib/products"
import { setToken } from "@/lib/auth"
import { Boxes, Lock, Mail, Loader2, AlertCircle } from "lucide-react"

export function LoginView({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const res = await fetch(AUTH_LOGIN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          Username: email,   // Mapeamos el estado local 'email' a la clave 'Username' que exige C#
          Password: password // Mapeamos el estado local 'password' a la clave 'Password' que exige C#
        }),
      })

      if (!res.ok) {
        if (res.status === 401) throw new Error("Credenciales incorrectas.")
        throw new Error(`Error del servidor (HTTP ${res.status}).`)
      }

      const data = await res.json()
      // Soporta distintas convenciones de nombre del backend.
      const token: string | undefined = data.token ?? data.accessToken ?? data.jwt
      if (!token) throw new Error("La respuesta no incluyó un token válido.")

      setToken(token)
      console.log("[v0] Login exitoso, token almacenado.")
      onSuccess()
    } catch (err) {
      setError((err as Error).message || "No se pudo iniciar sesión.")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Boxes className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">SmartInventory</h1>
            <p className="text-sm text-muted-foreground">Iniciá sesión para acceder al panel</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email o usuario
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="email"
                type="text"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@smartinventory.com"
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none ring-ring placeholder:text-muted-foreground focus:ring-2"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Contraseña
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none ring-ring placeholder:text-muted-foreground focus:ring-2"
              />
            </div>
          </div>

          {error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : null}

          <Button type="submit" disabled={isLoading} className="mt-1 gap-2">
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Ingresando...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </form>
      </div>
    </main>
  )
}
