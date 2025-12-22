import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MonthlySummary, HistoricalData } from '@/types'

// Helper to convert string/number to number (PostgreSQL NUMERIC comes as string)
function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0
  return typeof value === 'string' ? parseFloat(value) || 0 : value
}

// Raw types from RPC (amounts come as strings)
interface RawSummary {
  total_income: string | number
  total_expense: string | number
  balance: string | number
  transaction_count: number
  month_name: string
}

interface RawHistorical {
  month_name: string
  month_year: string
  total_income: string | number
  total_expense: string | number
  balance: string | number
  transaction_count: number
}

export function useSummary(tenantPhone: string | undefined) {
  const [summary, setSummary] = useState<MonthlySummary | null>(null)
  const [historical, setHistorical] = useState<HistoricalData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Immediately set loading false if no phone
    if (!tenantPhone) {
      setSummary(null)
      setHistorical([])
      setLoading(false)
      setError('Telefone do tenant nao disponivel. Faca login novamente.')
      return
    }

    let isMounted = true
    const controller = new AbortController()

    async function fetchData() {
      if (!isMounted) return
      setLoading(true)
      setError(null)

      try {
        // Fetch current month summary with timeout
        const summaryPromise = supabase
          .rpc('get_monthly_summary_by_phone', { p_phone: tenantPhone })

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout ao carregar resumo')), 10000)
        )

        const { data: summaryData, error: summaryError } = await Promise.race([
          summaryPromise,
          timeoutPromise
        ]) as Awaited<typeof summaryPromise>

        if (!isMounted) return
        if (summaryError) throw summaryError

        if (summaryData && summaryData.length > 0) {
          const raw = summaryData[0] as RawSummary
          setSummary({
            total_income: toNumber(raw.total_income),
            total_expense: toNumber(raw.total_expense),
            balance: toNumber(raw.balance),
            transaction_count: raw.transaction_count,
            month_name: raw.month_name,
          })
        } else {
          setSummary(null)
        }

        // Fetch historical data (6 months)
        const { data: historyData, error: historyError } = await supabase
          .rpc('get_historical_summary', {
            p_phone: tenantPhone,
            p_months_back: 6
          })

        if (!isMounted) return
        if (historyError) throw historyError

        // Transform historical data
        const transformedHistory: HistoricalData[] = (historyData || []).map((h: RawHistorical) => ({
          month_name: h.month_name,
          month_year: h.month_year,
          total_income: toNumber(h.total_income),
          total_expense: toNumber(h.total_expense),
          balance: toNumber(h.balance),
          transaction_count: h.transaction_count,
        }))

        if (isMounted) {
          setHistorical(transformedHistory)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [tenantPhone])

  return { summary, historical, loading, error }
}
