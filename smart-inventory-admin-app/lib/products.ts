import { authHeaders } from "@/lib/auth"

export interface Product {
  id: number
  name: string
  price: number
  stock: number
}

// API endpoint del backend .NET 9 Web API.
// Cambia el puerto si tu backend usa uno distinto.
export const PRODUCTS_ENDPOINT = "http://localhost:5290/api/products"

// Endpoint de autenticación que devuelve el JWT.
export const AUTH_LOGIN_ENDPOINT = "http://localhost:5290/api/auth/login"

// Stock por debajo de este valor dispara la alerta visual.
export const LOW_STOCK_THRESHOLD = 20

// Datos mockeados idénticos a la estructura del backend.
// Se usan como fallback si la conexión con la API falla.
export const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: "Notebook Lenovo ThinkPad", price: 1250.0, stock: 15 },
  { id: 2, name: "Mouse Inalámbrico Logitech", price: 35.5, stock: 40 },
  { id: 3, name: "Teclado Mecánico RGB", price: 89.99, stock: 8 },
  { id: 4, name: 'Monitor 27" 144Hz', price: 320.0, stock: 22 },
  { id: 5, name: "Webcam Full HD 1080p", price: 59.9, stock: 12 },
  { id: 6, name: "Auriculares Bluetooth", price: 79.0, stock: 5 },
  { id: 7, name: "SSD NVMe 1TB", price: 110.25, stock: 33 },
  { id: 8, name: "Hub USB-C 7 en 1", price: 42.0, stock: 18 },
  { id: 9, name: "Cargador GaN 100W", price: 65.0, stock: 27 },
  { id: 10, name: "Soporte Ergonómico Laptop", price: 28.75, stock: 3 },
]

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

export type ProductInput = Pick<Product, "name" | "price" | "stock">

async function parseApiError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string }
    if (data.message) return data.message
  } catch {
    // respuesta no JSON
  }
  return `Error del servidor (HTTP ${res.status}).`
}

export async function fetchProducts(token: string): Promise<Product[]> {
  const res = await fetch(PRODUCTS_ENDPOINT, {
    headers: { Accept: "application/json", ...authHeaders(token) },
    cache: "no-store",
  })

  if (res.status === 401) throw new Error("UNAUTHORIZED")
  if (!res.ok) throw new Error(await parseApiError(res))

  const data = (await res.json()) as Product[]
  if (!Array.isArray(data)) throw new Error("Respuesta inesperada del servidor.")
  return data
}

export async function createProduct(token: string, input: ProductInput): Promise<Product> {
  const res = await fetch(PRODUCTS_ENDPOINT, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  })

  if (res.status === 401) throw new Error("UNAUTHORIZED")
  if (res.status === 403) throw new Error("No tenés permisos para crear productos.")
  if (!res.ok) throw new Error(await parseApiError(res))

  return (await res.json()) as Product
}

export async function updateProduct(token: string, id: number, input: ProductInput): Promise<void> {
  const res = await fetch(`${PRODUCTS_ENDPOINT}/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  })

  if (res.status === 401) throw new Error("UNAUTHORIZED")
  if (res.status === 403) throw new Error("No tenés permisos para modificar productos.")
  if (!res.ok) throw new Error(await parseApiError(res))
}

export async function deleteProduct(token: string, id: number): Promise<void> {
  const res = await fetch(`${PRODUCTS_ENDPOINT}/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  })

  if (res.status === 401) throw new Error("UNAUTHORIZED")
  if (res.status === 403) throw new Error("No tenés permisos para eliminar productos.")
  if (!res.ok) throw new Error(await parseApiError(res))
}
