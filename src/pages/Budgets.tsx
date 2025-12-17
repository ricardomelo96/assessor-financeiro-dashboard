import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BudgetProgress } from '@/components/BudgetProgress'
import { Plus, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface MockBudget {
  id: string
  category: string
  spent: number
  limit: number
  alertLevel: 'OK' | 'WARNING' | 'EXCEEDED'
}

// Mock data
const mockBudgets: MockBudget[] = [
  {
    id: '1',
    category: 'Alimentação',
    spent: 1850,
    limit: 2000,
    alertLevel: 'WARNING',
  },
  {
    id: '2',
    category: 'Transporte',
    spent: 650,
    limit: 800,
    alertLevel: 'WARNING',
  },
  {
    id: '3',
    category: 'Moradia',
    spent: 2200,
    limit: 2000,
    alertLevel: 'EXCEEDED',
  },
  {
    id: '4',
    category: 'Entretenimento',
    spent: 380,
    limit: 500,
    alertLevel: 'OK',
  },
  {
    id: '5',
    category: 'Saúde',
    spent: 420,
    limit: 600,
    alertLevel: 'OK',
  },
]

export default function Budgets() {
  const okBudgets = mockBudgets.filter(b => b.alertLevel === 'OK')
  const warningBudgets = mockBudgets.filter(b => b.alertLevel === 'WARNING')
  const exceededBudgets = mockBudgets.filter(b => b.alertLevel === 'EXCEEDED')

  const totalSpent = mockBudgets.reduce((sum, b) => sum + b.spent, 0)
  const totalLimit = mockBudgets.reduce((sum, b) => sum + b.limit, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Orçamentos</h1>
          <p className="text-slate-400 mt-1">Gerencie seus orçamentos mensais</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Dentro do Orçamento
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">{okBudgets.length}</div>
            <p className="text-xs text-slate-400 mt-1">
              {okBudgets.length === 1 ? 'categoria' : 'categorias'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Próximo do Limite
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">{warningBudgets.length}</div>
            <p className="text-xs text-slate-400 mt-1">
              {warningBudgets.length === 1 ? 'categoria' : 'categorias'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Orçamento Excedido
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-50">{exceededBudgets.length}</div>
            <p className="text-xs text-slate-400 mt-1">
              {exceededBudgets.length === 1 ? 'categoria' : 'categorias'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Gasto</span>
              <span className="font-semibold text-slate-50">
                R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Orçamento Total</span>
              <span className="font-semibold text-slate-50">
                R$ {totalLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-slate-700 pt-2 mt-2">
              <span className="text-slate-400">Restante</span>
              <span
                className={`font-semibold ${
                  totalLimit - totalSpent >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                R${' '}
                {Math.abs(totalLimit - totalSpent).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Progress Cards */}
      <div>
        <h2 className="text-xl font-semibold text-slate-50 mb-4">
          Orçamentos por Categoria
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {mockBudgets.map((budget) => (
            <BudgetProgress
              key={budget.id}
              category={budget.category}
              spent={budget.spent}
              limit={budget.limit}
              alertLevel={budget.alertLevel}
            />
          ))}
        </div>
      </div>

      {/* Alerts Section */}
      {(warningBudgets.length > 0 || exceededBudgets.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exceededBudgets.map((budget) => (
                <div
                  key={budget.id}
                  className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/50 rounded-lg"
                >
                  <TrendingUp className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-400">
                      Orçamento excedido em {budget.category}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Você gastou R${' '}
                      {(budget.spent - budget.limit).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      a mais que o planejado.
                    </p>
                  </div>
                </div>
              ))}
              {warningBudgets.map((budget) => (
                <div
                  key={budget.id}
                  className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/50 rounded-lg"
                >
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-400">
                      Próximo do limite em {budget.category}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Você já gastou{' '}
                      {((budget.spent / budget.limit) * 100).toFixed(1)}% do
                      orçamento desta categoria.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
