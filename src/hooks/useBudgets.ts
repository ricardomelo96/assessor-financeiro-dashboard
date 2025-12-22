import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Budget } from '@/types'

// Helper to convert string/number to number (PostgreSQL NUMERIC comes as string)
function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0
  return typeof value === 'string' ? parseFloat(value) || 0 : value
}

// Raw budget from RPC
interface RawBudget {
  id: string
  tenant_id: string
  category_id: string
  category_name: string
  monthly_limit: string | number
  current_spent: string | number
  month_year: string
  alert_threshold: string | number
  alert_level: string
}

export function useBudgets(tenantPhone: string | undefined) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tenantPhone) {
      setLoading(false)
      setError('Telefone do tenant nao disponivel. Faca login novamente.')
      return
    }

    async function fetchBudgets() {
      setLoading(true)
      setError(null)

      try {
        const { data, error: fetchError } = await supabase
          .rpc('get_budgets_status', { p_phone: tenantPhone })

        if (fetchError) throw fetchError

        // Transform: convert amounts to numbers
        const transformed: Budget[] = (data || []).map((b: RawBudget) => ({
          id: b.id,
          tenant_id: b.tenant_id,
          category_id: b.category_id,
          category_name: b.category_name,
          monthly_limit: toNumber(b.monthly_limit),
          current_spent: toNumber(b.current_spent),
          month_year: b.month_year,
          alert_threshold: toNumber(b.alert_threshold),
          alert_level: b.alert_level as 'OK' | 'WARNING' | 'EXCEEDED',
        }))

        setBudgets(transformed)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar orcamentos')
      } finally {
        setLoading(false)
      }
    }

    fetchBudgets()
  }, [tenantPhone])

  const createBudget = useCallback(async (
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
  }, [tenantPhone])

  return { budgets, loading, error, createBudget }
}
