"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { type Product, type ProductInput } from "@/lib/products"
import { AlertCircle, Loader2, X } from "lucide-react"

type Mode = "create" | "edit"

interface ProductFormDialogProps {
  open: boolean
  mode: Mode
  product?: Product | null
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (input: ProductInput) => Promise<void>
}

const emptyForm: ProductInput = { name: "", price: 0, stock: 0 }

export function ProductFormDialog({
  open,
  mode,
  product,
  isSubmitting = false,
  onClose,
  onSubmit,
}: ProductFormDialogProps) {
  const [form, setForm] = useState<ProductInput>(emptyForm)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setForm(
      mode === "edit" && product
        ? { name: product.name, price: product.price, stock: product.stock }
        : emptyForm,
    )
  }, [open, mode, product])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const name = form.name.trim()
    const price = Number(form.price)
    const stock = Number(form.stock)

    if (!name) {
      setError("El nombre es obligatorio.")
      return
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("El precio debe ser mayor a 0.")
      return
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setError("El stock debe ser un entero mayor o igual a 0.")
      return
    }

    try {
      await onSubmit({ name, price, stock })
      onClose()
    } catch (err) {
      setError((err as Error).message || "No se pudo guardar el producto.")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="product-form-title" className="text-lg font-semibold text-foreground">
              {mode === "create" ? "Nuevo producto" : "Editar producto"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "create"
                ? "Completá los datos para agregar un producto al inventario."
                : `Modificando producto #${String(product?.id ?? "").padStart(3, "0")}`}
            </p>
          </div>
          <Button type="button" variant="outline" size="icon" onClick={onClose} className="shrink-0 bg-transparent">
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="product-name" className="text-sm font-medium text-foreground">
              Nombre
            </label>
            <input
              id="product-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="product-price" className="text-sm font-medium text-foreground">
                Precio (USD)
              </label>
              <input
                id="product-price"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.price || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="product-stock" className="text-sm font-medium text-foreground">
                Stock
              </label>
              <input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                required
                value={form.stock || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2"
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

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="bg-transparent">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Guardando...
                </>
              ) : mode === "create" ? (
                "Crear producto"
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
