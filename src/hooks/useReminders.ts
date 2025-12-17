import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Reminder } from '@/types'

export function useReminders(tenantPhone: string | undefined) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tenantPhone) {
      setLoading(false)
      return
    }

    async function fetchReminders() {
      setLoading(true)
      setError(null)

      try {
        const { data, error: fetchError } = await supabase
          .rpc('get_upcoming_reminders', { p_phone: tenantPhone })

        if (fetchError) throw fetchError
        setReminders(data || [])
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

  const pendingReminders = reminders.filter(r => !r.is_paid && new Date(r.due_date) >= new Date())
  const paidReminders = reminders.filter(r => r.is_paid)
  const overdueReminders = reminders.filter(r => !r.is_paid && new Date(r.due_date) < new Date())

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
