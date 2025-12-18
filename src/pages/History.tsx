import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useAuth, useSummary, useToast } from '@/hooks'
import { Loader2 } from 'lucide-react'

export default function History() {
  const { tenantPhone, loading: authLoading } = useAuth()
  const { historical, loading: summaryLoading, error: summaryError } = useSummary(tenantPhone)
  const { toast } = useToast()

  // Show errors as toasts
  useEffect(() => {
    if (summaryError) {
      toast({ title: 'Erro ao carregar histórico', description: summaryError, variant: 'destructive' })
    }
  }, [summaryError, toast])

  const isLoading = authLoading || summaryLoading

  // Transform data for chart (reversed to show oldest first)
  const chartData = [...historical].reverse().map(h => ({
    month: h.month_name,
    income: h.total_income,
    expense: h.total_expense,
    balance: h.balance,
  }))

  const totalIncome = historical.reduce((sum, item) => sum + item.total_income, 0)
  const totalExpense = historical.reduce((sum, item) => sum + item.total_expense, 0)
  const totalBalance = totalIncome - totalExpense

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg shadow-lg">
          <p className="text-slate-50 font-semibold mb-2">{payload[0].payload.month}</p>
          <p className="text-green-400 text-sm">
            Receitas: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-red-400 text-sm">
            Despesas: {formatCurrency(payload[1].value)}
          </p>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-slate-400">Carregando histórico...</p>
        </div>
      </div>
    )
  }

  const monthCount = historical.length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Histórico</h1>
        <p className="text-slate-400 mt-1">Visualize seu histórico financeiro</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Total Receitas ({monthCount} {monthCount === 1 ? 'mês' : 'meses'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Total Despesas ({monthCount} {monthCount === 1 ? 'mês' : 'meses'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(totalExpense)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Saldo Acumulado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {formatCurrency(totalBalance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Area Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center">
              <p className="text-slate-400">Nenhum dado histórico disponível</p>
            </div>
          ) : (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="square"
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                    name="Receitas"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                    name="Despesas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          {historical.length === 0 ? (
            <p className="text-slate-400 text-center py-4">Nenhum dado histórico disponível</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mês</TableHead>
                  <TableHead className="text-right">Receitas</TableHead>
                  <TableHead className="text-right">Despesas</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historical.map((item) => (
                  <TableRow key={item.month_year}>
                    <TableCell className="font-medium">{item.month_name}</TableCell>
                    <TableCell className="text-right text-green-500">
                      {formatCurrency(item.total_income)}
                    </TableCell>
                    <TableCell className="text-right text-red-500">
                      {formatCurrency(item.total_expense)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          item.balance >= 0
                            ? 'text-blue-400 font-semibold'
                            : 'text-red-400 font-semibold'
                        }
                      >
                        {formatCurrency(item.balance)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
