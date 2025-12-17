import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface SummaryCardProps {
  title: string
  value: number
  trend: number
  type: 'income' | 'expense' | 'balance'
}

export default function SummaryCard({ title, value, trend, type }: SummaryCardProps) {
  const Icon = type === 'income' ? TrendingUp : type === 'expense' ? TrendingDown : Wallet

  const iconColor = type === 'income'
    ? 'text-green-500'
    : type === 'expense'
    ? 'text-red-500'
    : value >= 0
    ? 'text-blue-500'
    : 'text-red-500'

  const valueColor = type === 'balance' && value < 0 ? 'text-red-500' : 'text-slate-50'

  const trendColor = trend >= 0 ? 'text-green-500' : 'text-red-500'
  const trendPrefix = trend >= 0 ? '+' : ''

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">
          {title}
        </CardTitle>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', valueColor)}>
          {formatCurrency(value)}
        </div>
        <p className={cn('text-xs mt-1', trendColor)}>
          {trendPrefix}{trend.toFixed(1)}% em relação ao mês anterior
        </p>
      </CardContent>
    </Card>
  )
}
