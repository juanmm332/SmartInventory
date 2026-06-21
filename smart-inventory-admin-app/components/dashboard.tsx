"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { KpiCard } from "@/components/kpi-card"
import { ProductsTable } from "@/components/products-table"
import { ProductFormDialog } from "@/components/product-form-dialog"
import {
  type Product,
  type ProductInput,
  MOCK_PRODUCTS,
  LOW_STOCK_THRESHOLD,
  formatCurrency,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/products"
import { getToken, clearToken, getUserRole, type UserRole } from "@/lib/auth"
import { Boxes, DollarSign, AlertTriangle, RefreshCw, Wifi, WifiOff, LogOut, Plus } from "lucide-react"

type Source = "api" | "mock" | "loading"
type FormMode = "create" | "edit"

export function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
  const [source, setSource] = useState<Source>("loading")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>("create")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const isAdmin = role === "admin"

  const handleUnauthorized = useCallback(() => {
    clearToken()
    onLogout()
  }, [onLogout])

  const loadProducts = useCallback(async () => {
    const token = getToken()
    if (!token) {
      handleUnauthorized()
      return
    }

    setRole(getUserRole())
    setIsRefreshing(true)
    setActionError(null)

    try {
      const data = await fetchProducts(token)
      setProducts(data)
      setSource("api")
    } catch (error) {
      if ((error as Error).message === "UNAUTHORIZED") {
        handleUnauthorized()
        return
      }
      setProducts(MOCK_PRODUCTS)
      setSource("mock")
    } finally {
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }
  }, [handleUnauthorized])

  const handleLogout = useCallback(() => {
    clearToken()
    onLogout()
  }, [onLogout])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const openCreateForm = useCallback(() => {
    setFormMode("create")
    setEditingProduct(null)
    setFormOpen(true)
  }, [])

  const openEditForm = useCallback((product: Product) => {
    setFormMode("edit")
    setEditingProduct(product)
    setFormOpen(true)
  }, [])

  const handleSaveProduct = useCallback(
    async (input: ProductInput) => {
      const token = getToken()
      if (!token) {
        handleUnauthorized()
        return
      }

      setIsSaving(true)
      setActionError(null)

      try {
        if (source === "api") {
          if (formMode === "create") {
            await createProduct(token, input)
          } else if (editingProduct) {
            await updateProduct(token, editingProduct.id, input)
          }
          await loadProducts()
          return
        }

        if (formMode === "create") {
          const nextId = products.reduce((max, item) => Math.max(max, item.id), 0) + 1
          setProducts((prev) => [...prev, { id: nextId, ...input }])
        } else if (editingProduct) {
          setProducts((prev) =>
            prev.map((item) => (item.id === editingProduct.id ? { ...item, ...input } : item)),
          )
        }
        setLastUpdated(new Date())
      } catch (error) {
        if ((error as Error).message === "UNAUTHORIZED") {
          handleUnauthorized()
          return
        }
        throw error
      } finally {
        setIsSaving(false)
      }
    },
    [source, formMode, editingProduct, products, loadProducts, handleUnauthorized],
  )

  const handleDeleteProduct = useCallback(
    async (product: Product) => {
      const confirmed = window.confirm(`¿Eliminar "${product.name}" del inventario?`)
      if (!confirmed) return

      const token = getToken()
      if (!token) {
        handleUnauthorized()
        return
      }

      setActionError(null)

      try {
        if (source === "api") {
          await deleteProduct(token, product.id)
          await loadProducts()
          return
        }

        setProducts((prev) => prev.filter((item) => item.id !== product.id))
        setLastUpdated(new Date())
      } catch (error) {
        if ((error as Error).message === "UNAUTHORIZED") {
          handleUnauthorized()
          return
        }
        setActionError((error as Error).message || "No se pudo eliminar el producto.")
      }
    },
    [source, loadProducts, handleUnauthorized],
  )

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
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Boxes className="size-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-pretty text-2xl font-semibold tracking-tight text-foreground">SmartInventory</h1>
                {role ? <RoleBadge role={role} /> : null}
              </div>
              <p className="text-sm text-muted-foreground">
                {isAdmin
                  ? "Panel de administración: gestioná el inventario completo"
                  : "Consulta de inventario (solo lectura)"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ConnectionBadge source={source} />
            <Button onClick={loadProducts} disabled={isRefreshing} className="gap-2">
              <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
              {isRefreshing ? "Actualizando..." : "Refrescar"}
            </Button>
            <Button onClick={handleLogout} variant="outline" className="gap-2 bg-transparent">
              <LogOut className="size-4" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Salir</span>
            </Button>
          </div>
        </header>

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

        <section aria-label="Listado de productos" className="mt-8">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Productos</h2>
              {lastUpdated ? (
                <p className="text-xs text-muted-foreground">
                  Actualizado: {lastUpdated.toLocaleTimeString("es-AR")}
                </p>
              ) : null}
            </div>
            {isAdmin ? (
              <Button onClick={openCreateForm} className="gap-2 self-start sm:self-auto">
                <Plus className="size-4" aria-hidden="true" />
                Nuevo producto
              </Button>
            ) : null}
          </div>

          {actionError ? (
            <div
              role="alert"
              className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {actionError}
            </div>
          ) : null}

          <ProductsTable
            products={products}
            canManage={isAdmin}
            onEdit={openEditForm}
            onDelete={handleDeleteProduct}
          />
        </section>
      </div>

      {isAdmin ? (
        <ProductFormDialog
          open={formOpen}
          mode={formMode}
          product={editingProduct}
          isSubmitting={isSaving}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSaveProduct}
        />
      ) : null}
    </main>
  )
}

function RoleBadge({ role }: { role: UserRole }) {
  if (role === "admin") {
    return (
      <Badge variant="secondary" className="border border-primary/30 bg-primary/15 text-primary">
        Administrador
      </Badge>
    )
  }

  return (
    <Badge variant="secondary" className="border border-border bg-muted text-muted-foreground">
      Vendedor
    </Badge>
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
