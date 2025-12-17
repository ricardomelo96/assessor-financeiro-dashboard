import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Budget } from '@/types'

export function useBudgets(tenantPhone: string | undefined) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tenantPhone) {
      setLoading(false)
      return
    }

    async function fetchBudgets() {
      setLoading(true)
      setError(null)

      try {
        const { data, error: fetchError } = await supabase
          .rpc('get_budgets_status', { p_phone: tenantPhone })

        if (fetchError) throw fetchError
        setBudgets(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar orcamentos')
      } finally {
        setLoading(false)
      }
    }

    fetchBudgets()
  }, [tenantPhone])

  const createBudget = async (
    categoryHint: string,
    monthlyLimit: number,
    alertThreshold: number = 0.8
  ) => {
    if (!tenantPhone) return { success: false, error: 'Telefone nao encontrado' }

    try {
      const now = new Date()
      const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

      const { data, error } = await supabase
        .rpc('create_budget', {
          p_phone: tenantPhone,
          p_category_hint: categoryHint,
          p_monthly_limit: monthlyLimit,
          p_month_year: monthYear,
          p_alert_threshold: alertThreshold
        })

      if (error) throw error

      // Refresh budgets
      const { data: refreshedData } = await supabase
        .rpc('get_budgets_status', { p_phone: tenantPhone })

      setBudgets(refreshedData || [])

      return { success: true, data }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao criar orcamento' }
    }
  }

  return { budgets, loading, error, createBudget }
}
