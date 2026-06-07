"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { KpiCard } from "@/components/kpi-card"
import { ProductsTable } from "@/components/products-table"
import {
  type Product,
  MOCK_PRODUCTS,
  PRODUCTS_ENDPOINT,
  LOW_STOCK_THRESHOLD,
  formatCurrency,
} from "@/lib/products"
import { Boxes, DollarSign, AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react"

type Source = "api" | "mock" | "loading"

export function Dashboard() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
  const [source, setSource] = useState<Source>("loading")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadProducts = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const res = await fetch(PRODUCTS_ENDPOINT, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as Product[]
      if (!Array.isArray(data)) throw new Error("Respuesta inesperada")
      setProducts(data)
      setSource("api")
      console.log("[v0] Productos cargados desde la API:", data.length)
    } catch (error) {
      // La app sigue siendo totalmente funcional con datos mockeados.
      console.log("[v0] Fallback a datos mockeados. Motivo:", (error as Error).message)
      setProducts(MOCK_PRODUCTS)
      setSource("mock")
    } finally {
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const { totalProducts, totalValue, lowStockCount } = useMemo(() => {
    return {
      totalProducts: products.length,
      totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
      lowStockCount: products.filter((p) => p.stock < LOW_STOCK_THRESHOLD).length,
    }
  }, [products])

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Boxes className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-pretty text-2xl font-semibold tracking-tight text-foreground">SmartInventory</h1>
              <p className="text-sm text-muted-foreground">Panel de administración de inventario</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ConnectionBadge source={source} />
            <Button onClick={loadProducts} disabled={isRefreshing} className="gap-2">
              <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
              {isRefreshing ? "Actualizando..." : "Refrescar"}
            </Button>
          </div>
        </header>

        {/* KPIs */}
        <section aria-label="Indicadores clave" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            label="Productos distintos"
            value={totalProducts.toString()}
            icon={Boxes}
            hint="Total de SKUs en inventario"
          />
          <KpiCard
            label="Valor total del stock"
            value={formatCurrency(totalValue)}
            icon={DollarSign}
            hint="Suma de precio × stock"
          />
          <KpiCard
            label="Alertas de stock bajo"
            value={lowStockCount.toString()}
            icon={AlertTriangle}
            accent={lowStockCount > 0 ? "warning" : "default"}
            hint={`Menos de ${LOW_STOCK_THRESHOLD} unidades`}
          />
        </section>

        {/* Tabla */}
        <section aria-label="Listado de productos" className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Productos</h2>
            {lastUpdated ? (
              <p className="text-xs text-muted-foreground">
                Actualizado: {lastUpdated.toLocaleTimeString("es-AR")}
              </p>
            ) : null}
          </div>
          <ProductsTable products={products} />
        </section>
      </div>
    </main>
  )
}

function ConnectionBadge({ source }: { source: Source }) {
  if (source === "api") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-400">
        <Wifi className="size-3.5" aria-hidden="true" />
        API conectada
      </span>
    )
  }
  if (source === "mock") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-400">
        <WifiOff className="size-3.5" aria-hidden="true" />
        Modo offline (mock)
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
      <RefreshCw className="size-3.5 animate-spin" aria-hidden="true" />
      Conectando...
    </span>
  )
}
