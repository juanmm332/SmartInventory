import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface KpiCardProps {
  label: string
  value: string
  icon: LucideIcon
  accent?: "default" | "warning"
  hint?: string
}

export function KpiCard({ label, value, icon: Icon, accent = "default", hint }: KpiCardProps) {
  return (
    <Card className="border-border/60 bg-card">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-lg",
            accent === "warning" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary",
          )}
        >
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="truncate text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  )
}
