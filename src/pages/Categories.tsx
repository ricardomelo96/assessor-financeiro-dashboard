import { useState } from 'react'
import {
  ShoppingCart,
  Car,
  Home,
  Smile,
  Heart,
  MoreHorizontal,
  DollarSign,
  Briefcase,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CategoryDonutChart } from '@/components/CategoryDonutChart'
import { formatCurrency } from '@/lib/utils'
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

// Mock data for categories
const mockCategories: (Category & { icon_name: string })[] = [
  {
    id: '1',
    tenant_id: '1',
    name: 'Alimentacao',
    type: 'expense',
    icon: 'shopping',
    icon_name: 'shopping',
    sort_order: 1,
  },
  {
    id: '2',
    tenant_id: '1',
    name: 'Transporte',
    type: 'expense',
    icon: 'car',
    icon_name: 'car',
    sort_order: 2,
  },
  {
    id: '3',
    tenant_id: '1',
    name: 'Moradia',
    type: 'expense',
    icon: 'home',
    icon_name: 'home',
    sort_order: 3,
  },
  {
    id: '4',
    tenant_id: '1',
    name: 'Lazer',
    type: 'expense',
    icon: 'smile',
    icon_name: 'smile',
    sort_order: 4,
  },
  {
    id: '5',
    tenant_id: '1',
    name: 'Saude',
    type: 'expense',
    icon: 'heart',
    icon_name: 'heart',
    sort_order: 5,
  },
  {
    id: '6',
    tenant_id: '1',
    name: 'Outros',
    type: 'expense',
    icon: 'more',
    icon_name: 'more',
    sort_order: 6,
  },
  {
    id: '7',
    tenant_id: '1',
    name: 'Salario',
    type: 'income',
    icon: 'dollar',
    icon_name: 'dollar',
    sort_order: 1,
  },
  {
    id: '8',
    tenant_id: '1',
    name: 'Renda Extra',
    type: 'income',
    icon: 'briefcase',
    icon_name: 'briefcase',
    sort_order: 2,
  },
]

// Mock spending data
const mockExpenseSpending: CategorySpending[] = [
  {
    category_id: '1',
    category_name: 'Alimentacao',
    total_spent: 850.0,
    percentage_of_total: 30.0,
    transaction_count: 15,
  },
  {
    category_id: '2',
    category_name: 'Transporte',
    total_spent: 450.0,
    percentage_of_total: 16.0,
    transaction_count: 8,
  },
  {
    category_id: '3',
    category_name: 'Moradia',
    total_spent: 1200.0,
    percentage_of_total: 42.0,
    transaction_count: 3,
  },
  {
    category_id: '4',
    category_name: 'Lazer',
    total_spent: 200.0,
    percentage_of_total: 7.0,
    transaction_count: 4,
  },
  {
    category_id: '5',
    category_name: 'Saude',
    total_spent: 100.0,
    percentage_of_total: 3.5,
    transaction_count: 2,
  },
  {
    category_id: '6',
    category_name: 'Outros',
    total_spent: 50.0,
    percentage_of_total: 1.5,
    transaction_count: 1,
  },
]

const mockIncomeSpending: CategorySpending[] = [
  {
    category_id: '7',
    category_name: 'Salario',
    total_spent: 5000.0,
    percentage_of_total: 83.0,
    transaction_count: 1,
  },
  {
    category_id: '8',
    category_name: 'Renda Extra',
    total_spent: 1000.0,
    percentage_of_total: 17.0,
    transaction_count: 3,
  },
]

const COLORS = [
  '#3b82f6', // blue-500
  '#22c55e', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#a855f7', // purple-500
  '#ec4899', // pink-500
]

export default function Categories() {
  const [expenseData] = useState<CategorySpending[]>(mockExpenseSpending)
  const [incomeData] = useState<CategorySpending[]>(mockIncomeSpending)

  const expenseCategories = mockCategories.filter((cat) => cat.type === 'expense')
  const incomeCategories = mockCategories.filter((cat) => cat.type === 'income')

  const totalExpenses = expenseData.reduce((sum, item) => sum + item.total_spent, 0)
  const totalIncome = incomeData.reduce((sum, item) => sum + item.total_spent, 0)

  const renderCategoryList = (
    categories: typeof mockCategories,
    spendingData: CategorySpending[],
    total: number,
    type: 'expense' | 'income'
  ) => {
    return (
      <div className="space-y-3">
        {categories.map((category, index) => {
          const spending = spendingData.find((s) => s.category_id === category.id)
          const Icon = iconMap[category.icon_name] || MoreHorizontal
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
                    {spending?.transaction_count || 0} transacoes este mes
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-semibold ${
                    type === 'income' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {formatCurrency(spending?.total_spent || 0)}
                </p>
                <p className="text-sm text-slate-400">
                  {spending?.percentage_of_total.toFixed(1) || 0}% do total
                </p>
              </div>
            </div>
          )
        })}
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
              <CardTitle>Distribuicao de Despesas</CardTitle>
              <p className="text-sm text-slate-400">
                Total: {formatCurrency(totalExpenses)}
              </p>
            </CardHeader>
            <CardContent>
              <CategoryDonutChart data={expenseData} />
            </CardContent>
          </Card>

          {/* List */}
          <Card>
            <CardHeader>
              <CardTitle>Categorias de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              {renderCategoryList(expenseCategories, expenseData, totalExpenses, 'expense')}
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
              <CardTitle>Distribuicao de Receitas</CardTitle>
              <p className="text-sm text-slate-400">
                Total: {formatCurrency(totalIncome)}
              </p>
            </CardHeader>
            <CardContent>
              <CategoryDonutChart data={incomeData} />
            </CardContent>
          </Card>

          {/* List */}
          <Card>
            <CardHeader>
              <CardTitle>Categorias de Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              {renderCategoryList(incomeCategories, incomeData, totalIncome, 'income')}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
