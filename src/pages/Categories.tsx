import { useEffect } from 'react'
import {
  ShoppingCart,
  Car,
  Home,
  Smile,
  Heart,
  MoreHorizontal,
  DollarSign,
  Briefcase,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CategoryDonutChart } from '@/components/CategoryDonutChart'
import { formatCurrency } from '@/lib/utils'
import { useAuth, useCategories, useToast } from '@/hooks'
import type { CategorySpending, Category } from '@/types'

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  shopping: ShoppingCart,
  car: Car,
  home: Home,
  smile: Smile,
  heart: Heart,
  more: MoreHorizontal,
  dollar: DollarSign,
  briefcase: Briefcase,
}

const COLORS = [
  '#3b82f6', // blue-500
  '#22c55e', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#a855f7', // purple-500
  '#ec4899', // pink-500
]

export default function Categories() {
  const { tenantPhone, loading: authLoading } = useAuth()
  const { categories, incomeCategories, expenseCategories, spending, loading: categoriesLoading, error: categoriesError } = useCategories(tenantPhone)
  const { toast } = useToast()

  // Show errors as toasts
  useEffect(() => {
    if (categoriesError) {
      toast({ title: 'Erro ao carregar categorias', description: categoriesError, variant: 'destructive' })
    }
  }, [categoriesError, toast])

  const isLoading = authLoading || categoriesLoading

  // Split spending by type based on category
  const expenseSpending = spending.filter(s => {
    const cat = categories.find(c => c.id === s.category_id)
    return cat?.type === 'expense'
  })

  const incomeSpending = spending.filter(s => {
    const cat = categories.find(c => c.id === s.category_id)
    return cat?.type === 'income'
  })

  const totalExpenses = expenseSpending.reduce((sum, item) => sum + (item.total_spent || 0), 0)
  const totalIncome = incomeSpending.reduce((sum, item) => sum + (item.total_spent || 0), 0)

  const renderCategoryList = (
    cats: Category[],
    spendingData: CategorySpending[],
    _total: number,
    type: 'expense' | 'income'
  ) => {
    return (
      <div className="space-y-3">
        {cats.map((category, index) => {
          const categorySpending = spendingData.find((s) => s.category_id === category.id)
          const Icon = iconMap[category.icon || 'more'] || MoreHorizontal
          const color = COLORS[index % COLORS.length]

          return (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-50">{category.name}</span>
                    <Badge variant={type === 'expense' ? 'danger' : 'success'}>
                      {type === 'expense' ? 'Despesa' : 'Receita'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    {categorySpending?.transaction_count || 0} transações este mês
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-semibold ${
                    type === 'income' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {formatCurrency(categorySpending?.total_spent || 0)}
                </p>
                <p className="text-sm text-slate-400">
                  {categorySpending?.percentage_of_total?.toFixed(1) || 0}% do total
                </p>
              </div>
            </div>
          )
        })}
        {cats.length === 0 && (
          <p className="text-slate-400 text-center py-4">Nenhuma categoria encontrada</p>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-slate-400">Carregando categorias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Categorias</h1>
        <p className="text-slate-400 mt-1">Visualize seus gastos e receitas por categoria</p>
      </div>

      {/* Expense Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-50">Despesas</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Despesas</CardTitle>
              <p className="text-sm text-slate-400">
                Total: {formatCurrency(totalExpenses)}
              </p>
            </CardHeader>
            <CardContent>
              <CategoryDonutChart data={expenseSpending} />
            </CardContent>
          </Card>

          {/* List */}
          <Card>
            <CardHeader>
              <CardTitle>Categorias de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              {renderCategoryList(expenseCategories, expenseSpending, totalExpenses, 'expense')}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Income Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-50">Receitas</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Receitas</CardTitle>
              <p className="text-sm text-slate-400">
                Total: {formatCurrency(totalIncome)}
              </p>
            </CardHeader>
            <CardContent>
              <CategoryDonutChart data={incomeSpending} />
            </CardContent>
          </Card>

          {/* List */}
          <Card>
            <CardHeader>
              <CardTitle>Categorias de Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              {renderCategoryList(incomeCategories, incomeSpending, totalIncome, 'income')}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
