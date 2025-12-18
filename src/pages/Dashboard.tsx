import { useEffect } from 'react'
import SummaryCard from '@/components/SummaryCard'
import TrendChart from '@/components/TrendChart'
import RecentTransactions from '@/components/RecentTransactions'
import UpcomingReminders from '@/components/UpcomingReminders'
import { useAuth, useSummary, useTransactions, useReminders, useToast } from '@/hooks'
import { Loader2 } from 'lucide-react'

export default function Dashboard() {
  const { tenantPhone, loading: authLoading } = useAuth()
  const { summary, historical, loading: summaryLoading, error: summaryError } = useSummary(tenantPhone)
  const { transactions, loading: transactionsLoading, error: transactionsError } = useTransactions({ tenantPhone, limit: 5 })
  const { pendingReminders, loading: remindersLoading, error: remindersError } = useReminders(tenantPhone)
  const { toast } = useToast()

  // Show errors as toasts
  useEffect(() => {
    if (summaryError) {
      toast({ title: 'Erro ao carregar resumo', description: summaryError, variant: 'destructive' })
    }
    if (transactionsError) {
      toast({ title: 'Erro ao carregar transações', description: transactionsError, variant: 'destructive' })
    }
    if (remindersError) {
      toast({ title: 'Erro ao carregar lembretes', description: remindersError, variant: 'destructive' })
    }
  }, [summaryError, transactionsError, remindersError, toast])

  const isLoading = authLoading || summaryLoading || transactionsLoading || remindersLoading

  // Transform transactions for RecentTransactions component (expects 'category' not 'category_name')
  const formattedTransactions = transactions.map(t => ({
    id: t.id,
    date: t.date,
    description: t.description,
    category: t.category_name || 'Sem categoria',
    amount: t.amount,
    type: t.type,
  }))

  // Transform reminders for UpcomingReminders component (only needs id, title, due_date, amount)
  const formattedReminders = pendingReminders.slice(0, 5).map(r => ({
    id: r.id,
    title: r.title,
    due_date: r.due_date,
    amount: r.amount,
  }))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-slate-400">Carregando dados...</p>
        </div>
      </div>
    )
  }

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
            value={summary?.total_income || 0}
            trend={0}
            type="income"
          />
          <SummaryCard
            title="Despesas"
            value={summary?.total_expense || 0}
            trend={0}
            type="expense"
          />
          <SummaryCard
            title="Saldo"
            value={summary?.balance || 0}
            trend={0}
            type="balance"
          />
        </div>

        {/* Trend Chart */}
        <TrendChart data={historical} />

        {/* Recent Transactions and Upcoming Reminders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTransactions transactions={formattedTransactions} />
          <UpcomingReminders reminders={formattedReminders} />
        </div>
      </div>
    </div>
  )
}
