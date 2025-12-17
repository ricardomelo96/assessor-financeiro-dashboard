import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MonthlySummary, HistoricalData } from '@/types'

export function useSummary(tenantPhone: string | undefined) {
  const [summary, setSummary] = useState<MonthlySummary | null>(null)
  const [historical, setHistorical] = useState<HistoricalData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tenantPhone) {
      setLoading(false)
      return
    }

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        // Fetch current month summary
        const { data: summaryData, error: summaryError } = await supabase
          .rpc('get_monthly_summary_by_phone', { p_phone: tenantPhone })

        if (summaryError) throw summaryError
        if (summaryData && summaryData.length > 0) {
          setSummary(summaryData[0])
        }

        // Fetch historical data (6 months)
        const { data: historyData, error: historyError } = await supabase
          .rpc('get_historical_summary', {
            p_phone: tenantPhone,
            p_months_back: 6
          })

        if (historyError) throw historyError
        setHistorical(historyData || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tenantPhone])

  return { summary, historical, loading, error }
}
