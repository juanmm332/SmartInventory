export interface Product {
  id: number
  name: string
  price: number
  stock: number
}

// API endpoint del backend .NET 9 Web API.
// Cambia el puerto si tu backend usa uno distinto.
export const PRODUCTS_ENDPOINT = "https://localhost:7082/api/products"

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
