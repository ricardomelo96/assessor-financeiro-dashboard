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

interface MonthData {
  month: string
  income: number
  expense: number
  balance: number
}

// Mock data for 12 months
const mockHistoryData: MonthData[] = [
  { month: 'Jan 2023', income: 8500, expense: 6200, balance: 2300 },
  { month: 'Fev 2023', income: 9200, expense: 6800, balance: 2400 },
  { month: 'Mar 2023', income: 8800, expense: 7100, balance: 1700 },
  { month: 'Abr 2023', income: 9500, expense: 6500, balance: 3000 },
  { month: 'Mai 2023', income: 9000, expense: 7300, balance: 1700 },
  { month: 'Jun 2023', income: 9800, expense: 6900, balance: 2900 },
  { month: 'Jul 2023', income: 10200, expense: 7500, balance: 2700 },
  { month: 'Ago 2023', income: 9600, expense: 7800, balance: 1800 },
  { month: 'Set 2023', income: 10500, expense: 7200, balance: 3300 },
  { month: 'Out 2023', income: 11000, expense: 8100, balance: 2900 },
  { month: 'Nov 2023', income: 10800, expense: 7600, balance: 3200 },
  { month: 'Dez 2023', income: 12500, expense: 9200, balance: 3300 },
]

export default function History() {
  const totalIncome = mockHistoryData.reduce((sum, item) => sum + item.income, 0)
  const totalExpense = mockHistoryData.reduce((sum, item) => sum + item.expense, 0)
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
              Total Receitas (12 meses)
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
              Total Despesas (12 meses)
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
          <CardTitle>Evolução Financeira (12 Meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={mockHistoryData}
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
        </CardContent>
      </Card>

      {/* Monthly Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Mensal</CardTitle>
        </CardHeader>
        <CardContent>
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
              {mockHistoryData.map((item) => (
                <TableRow key={item.month}>
                  <TableCell className="font-medium">{item.month}</TableCell>
                  <TableCell className="text-right text-green-500">
                    {formatCurrency(item.income)}
                  </TableCell>
                  <TableCell className="text-right text-red-500">
                    {formatCurrency(item.expense)}
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
        </CardContent>
      </Card>
    </div>
  )
}
