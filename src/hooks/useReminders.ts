import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Reminder } from '@/types'

// Map database type to UI type
function mapReminderType(dbType: string): 'income' | 'expense' {
  return dbType === 'receivable' ? 'income' : 'expense'
}

// Raw data from RPC (amounts come as strings from PostgreSQL NUMERIC)
interface RawReminder {
  id: string
  tenant_id: string
  title: string
  amount: string | number
  due_date: string
  type: string
  is_paid: boolean
  paid_at: string | null
  category_id: string | null
  category_name: string | null
  days_until: number
}

export function useReminders(tenantPhone: string | undefined) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tenantPhone) {
      setLoading(false)
      setError('Telefone do tenant nao disponivel. Faca login novamente.')
      return
    }

    async function fetchReminders() {
      setLoading(true)
      setError(null)

      try {
        const { data, error: fetchError } = await supabase
          .rpc('get_all_reminders', { p_phone: tenantPhone })

        if (fetchError) throw fetchError

        // Transform raw data: convert amount to number and map type
        const transformed: Reminder[] = (data || []).map((r: RawReminder) => ({
          id: r.id,
          tenant_id: r.tenant_id,
          title: r.title,
          amount: typeof r.amount === 'string' ? parseFloat(r.amount) || 0 : r.amount,
          due_date: r.due_date,
          type: mapReminderType(r.type),
          is_paid: r.is_paid,
          paid_at: r.paid_at || undefined,
          category_id: r.category_id || undefined,
          category_name: r.category_name || undefined,
        }))

        setReminders(transformed)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar lembretes')
      } finally {
        setLoading(false)
      }
    }

    fetchReminders()
  }, [tenantPhone])

  const markAsPaid = async (reminderTitle: string) => {
    if (!tenantPhone) return { success: false, error: 'Telefone nao encontrado' }

    try {
      const { data, error } = await supabase
        .rpc('mark_reminder_paid_by_title', {
          p_phone: tenantPhone,
          p_title: reminderTitle
        })

      if (error) throw error

      // Update local state
      setReminders(prev =>
        prev.map(r =>
          r.title === reminderTitle
            ? { ...r, is_paid: true, paid_at: new Date().toISOString() }
            : r
        )
      )

      return { success: true, data }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao marcar como pago' }
    }
  }

  const pendingReminders = useMemo(() =>
    reminders.filter(r => !r.is_paid && new Date(r.due_date) >= new Date()),
    [reminders]
  )
  const paidReminders = useMemo(() =>
    reminders.filter(r => r.is_paid),
    [reminders]
  )
  const overdueReminders = useMemo(() =>
    reminders.filter(r => !r.is_paid && new Date(r.due_date) < new Date()),
    [reminders]
  )

  return {
    reminders,
    pendingReminders,
    paidReminders,
    overdueReminders,
    loading,
    error,
    markAsPaid
  }
}
