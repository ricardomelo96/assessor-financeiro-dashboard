import SummaryCard from '@/components/SummaryCard'
import TrendChart from '@/components/TrendChart'
import RecentTransactions from '@/components/RecentTransactions'
import UpcomingReminders from '@/components/UpcomingReminders'

// Mock data for demonstration
const mockSummaryData = {
  income: 5000,
  expense: 3200,
  balance: 1800,
  incomeTrend: 8.5,
  expenseTrend: -3.2,
  balanceTrend: 12.7,
}

const mockTrendData = [
  { month_name: 'Jul', total_income: 4200, total_expense: 3100 },
  { month_name: 'Ago', total_income: 4500, total_expense: 3300 },
  { month_name: 'Set', total_income: 4800, total_expense: 3500 },
  { month_name: 'Out', total_income: 4600, total_expense: 3200 },
  { month_name: 'Nov', total_income: 4900, total_expense: 3400 },
  { month_name: 'Dez', total_income: 5000, total_expense: 3200 },
]

const mockTransactions = [
  {
    id: '1',
    date: '2024-12-15',
    description: 'Salário',
    category: 'Trabalho',
    amount: 5000,
    type: 'income' as const,
  },
  {
    id: '2',
    date: '2024-12-14',
    description: 'Supermercado',
    category: 'Alimentação',
    amount: -350,
    type: 'expense' as const,
  },
  {
    id: '3',
    date: '2024-12-12',
    description: 'Conta de Luz',
    category: 'Utilidades',
    amount: -180,
    type: 'expense' as const,
  },
  {
    id: '4',
    date: '2024-12-10',
    description: 'Freelance',
    category: 'Trabalho',
    amount: 1200,
    type: 'income' as const,
  },
  {
    id: '5',
    date: '2024-12-08',
    description: 'Academia',
    category: 'Saúde',
    amount: -150,
    type: 'expense' as const,
  },
]

const mockReminders = [
  {
    id: '1',
    title: 'Pagamento do Aluguel',
    due_date: '2024-12-20',
    amount: 1200,
  },
  {
    id: '2',
    title: 'Fatura do Cartão de Crédito',
    due_date: '2024-12-25',
    amount: 850,
  },
  {
    id: '3',
    title: 'Seguro do Carro',
    due_date: '2024-12-28',
    amount: 450,
  },
  {
    id: '4',
    title: 'Internet',
    due_date: '2024-12-15',
    amount: 120,
  },
  {
    id: '5',
    title: 'Mensalidade da Academia',
    due_date: '2025-01-05',
    amount: 150,
  },
]

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Dashboard</h1>
          <p className="text-slate-400 mt-2">
            Visão geral das suas finanças
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard
            title="Receitas"
            value={mockSummaryData.income}
            trend={mockSummaryData.incomeTrend}
            type="income"
          />
          <SummaryCard
            title="Despesas"
            value={mockSummaryData.expense}
            trend={mockSummaryData.expenseTrend}
            type="expense"
          />
          <SummaryCard
            title="Saldo"
            value={mockSummaryData.balance}
            trend={mockSummaryData.balanceTrend}
            type="balance"
          />
        </div>

        {/* Trend Chart */}
        <TrendChart data={mockTrendData} />

        {/* Recent Transactions and Upcoming Reminders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTransactions transactions={mockTransactions} />
          <UpcomingReminders reminders={mockReminders} />
        </div>
      </div>
    </div>
  )
}
