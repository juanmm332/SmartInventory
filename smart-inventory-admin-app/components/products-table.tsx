import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { type Product, LOW_STOCK_THRESHOLD, formatCurrency } from "@/lib/products"
import { AlertTriangle, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductsTableProps {
  products: Product[]
  canManage?: boolean
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
}

export function ProductsTable({ products, canManage = false, onEdit, onDelete }: ProductsTableProps) {
  const columnCount = canManage ? 6 : 5

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
            {canManage ? <TableHead className="w-28 text-right text-muted-foreground">Acciones</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const isLow = product.stock < LOW_STOCK_THRESHOLD
            return (
              <TableRow key={product.id} className="border-border/60">
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {String(product.id).padStart(3, "0")}
                </TableCell>
                <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                <TableCell className="text-right font-mono text-foreground">
                  {formatCurrency(product.price)}
                </TableCell>
                <TableCell className={cn("text-right font-mono", isLow ? "text-destructive" : "text-foreground")}>
                  {product.stock}
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
                {canManage ? (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="bg-transparent"
                        aria-label={`Editar ${product.name}`}
                        onClick={() => onEdit?.(product)}
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="bg-transparent text-destructive hover:text-destructive"
                        aria-label={`Eliminar ${product.name}`}
                        onClick={() => onDelete?.(product)}
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                ) : null}
              </TableRow>
            )
          })}
          {products.length === 0 ? (
            <TableRow className="border-border/60">
              <TableCell colSpan={columnCount} className="py-10 text-center text-muted-foreground">
                No hay productos para mostrar.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  )
}
