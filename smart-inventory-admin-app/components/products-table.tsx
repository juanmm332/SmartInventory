import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { type Product, LOW_STOCK_THRESHOLD, formatCurrency } from "@/lib/products"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductsTableProps {
  products: Product[]
  editingId: number | null
  editPrice: string
  editStock: string
  saving: boolean
  onEdit: (product: Product) => void
  onPriceChange: (value: string) => void
  onStockChange: (value: string) => void
  onSave: (id: number) => void
  onCancel: () => void
  onDelete: (id: number) => void
}

export function ProductsTable({
  products,
  editingId,
  editPrice,
  editStock,
  saving,
  onEdit,
  onPriceChange,
  onStockChange,
  onSave,
  onCancel,
  onDelete,
}: ProductsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            <TableHead className="w-16 text-muted-foreground">ID</TableHead>
            <TableHead className="text-muted-foreground">Nombre</TableHead>
            <TableHead className="text-right text-muted-foreground">Precio</TableHead>
            <TableHead className="text-right text-muted-foreground">Stock</TableHead>
            <TableHead className="text-right text-muted-foreground">Estado</TableHead>
            <TableHead className="text-right text-muted-foreground">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const isLow = product.stock < LOW_STOCK_THRESHOLD
            const isEditing = editingId === product.id

            return (
              <TableRow key={product.id} className="border-border/60">
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {String(product.id).padStart(3, "0")}
                </TableCell>
                <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                <TableCell className="text-right font-mono text-foreground">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editPrice}
                      onChange={(event) => onPriceChange(event.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-2 py-1 text-right text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  ) : (
                    formatCurrency(product.price)
                  )}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-mono",
                    isLow ? "text-destructive" : "text-foreground",
                  )}
                >
                  {isEditing ? (
                    <input
                      type="number"
                      value={editStock}
                      onChange={(event) => onStockChange(event.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-2 py-1 text-right text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  ) : (
                    product.stock
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {isLow ? (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="size-3" aria-hidden="true" />
                      Stock bajo
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="border border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                    >
                      En stock
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {isEditing ? (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => onSave(product.id)}
                        className="rounded-lg border border-border bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={onCancel}
                        className="rounded-lg border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground transition hover:bg-muted/80 disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium text-foreground transition hover:bg-muted/50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(product.id)}
                        className="rounded-lg border border-destructive/70 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive transition hover:bg-destructive/20"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
          {products.length === 0 ? (
            <TableRow className="border-border/60">
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                No hay productos para mostrar.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  )
}
