const TOKEN_KEY = "token"

export type UserRole = "admin" | "seller"

const ROLE_CLAIM_KEYS = [
  "role",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
]

// Lee el JWT persistido en el navegador. Devuelve null en SSR o si no existe.
export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

// Persiste el JWT en localStorage.
export function setToken(token: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(TOKEN_KEY, token)
}

// Elimina el JWT (logout o respuesta 401).
export function clearToken() {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_KEY)
}

// Cabeceras estándar con el Bearer token para llamadas autenticadas.
export function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    return JSON.parse(atob(normalized)) as Record<string, unknown>
  } catch {
    return null
  }
}

// Extrae el rol del JWT emitido por el backend (.NET ClaimTypes.Role).
export function getUserRole(): UserRole | null {
  const token = getToken()
  if (!token) return null

  const payload = decodeJwtPayload(token)
  if (!payload) return null

  for (const key of ROLE_CLAIM_KEYS) {
    const value = payload[key]
    if (value === "admin" || value === "seller") return value
    if (Array.isArray(value)) {
      const match = value.find((item) => item === "admin" || item === "seller")
      if (match === "admin" || match === "seller") return match
    }
  }

  return null
}

export function isAdmin(): boolean {
  return getUserRole() === "admin"
}
