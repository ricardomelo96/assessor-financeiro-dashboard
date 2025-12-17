import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, cn } from '@/lib/utils'

interface BudgetProgressProps {
  category: string
  spent: number
  limit: number
  alertLevel: 'OK' | 'WARNING' | 'EXCEEDED'
}

export function BudgetProgress({ category, spent, limit, alertLevel }: BudgetProgressProps) {
  const percentage = Math.min((spent / limit) * 100, 100)

  const getProgressColor = () => {
    if (alertLevel === 'EXCEEDED') return 'bg-red-500'
    if (alertLevel === 'WARNING') return 'bg-amber-500'
    return 'bg-blue-500'
  }

  const getBadgeVariant = () => {
    if (alertLevel === 'EXCEEDED') return 'danger'
    if (alertLevel === 'WARNING') return 'warning'
    return 'success'
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg text-slate-50">{category}</h3>
              <p className="text-sm text-slate-400 mt-1">
                {formatCurrency(spent)} de {formatCurrency(limit)}
              </p>
            </div>
            {alertLevel !== 'OK' && (
              <Badge variant={getBadgeVariant()}>
                {alertLevel === 'EXCEEDED' ? 'EXCEDIDO' : 'ALERTA'}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-900">
              <div
                className={cn(
                  "h-full transition-all",
                  getProgressColor()
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className={cn(
                "text-sm font-medium",
                alertLevel === 'EXCEEDED' ? 'text-red-400' :
                alertLevel === 'WARNING' ? 'text-amber-400' :
                'text-blue-400'
              )}>
                {percentage.toFixed(1)}%
              </span>
              {percentage >= 100 && (
                <span className="text-sm text-red-400 font-medium">
                  Excedido em {formatCurrency(spent - limit)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
