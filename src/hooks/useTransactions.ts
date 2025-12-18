import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Transaction } from '@/types'

// Helper to convert string/number to number (PostgreSQL NUMERIC comes as string)
function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0
  return typeof value === 'string' ? parseFloat(value) || 0 : value
}

interface UseTransactionsOptions {
  tenantPhone?: string
  limit?: number
}

// Raw transaction from RPC (amounts as strings from PostgreSQL NUMERIC)
interface RawTransaction {
  id: string
  type: string
  amount: string | number
  description: string
  date: string
  category_id: string
  category_name: string | null
  category_icon: string | null
  created_at: string
}

export function useTransactions({ tenantPhone, limit }: UseTransactionsOptions) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tenantPhone) {
      setLoading(false)
      return
    }

    async function fetchTransactions() {
      setLoading(true)
      setError(null)

      try {
        // Use RPC for proper tenant filtering
        const { data, error: fetchError } = await supabase
          .rpc('get_transactions_by_phone', {
            p_phone: tenantPhone,
            p_limit: limit || 50
          })

        if (fetchError) throw fetchError

        // Transform: convert amounts to numbers
        const formattedData: Transaction[] = (data || []).map((t: RawTransaction) => ({
          id: t.id,
          tenant_id: '', // Not returned by RPC, but not needed for display
          type: t.type as 'income' | 'expense',
          amount: toNumber(t.amount),
          description: t.description,
          category_id: t.category_id,
          category_name: t.category_name || 'Sem categoria',
          date: t.date,
          created_at: t.created_at,
        }))

        setTransactions(formattedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar transacoes')
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [tenantPhone, limit])

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'tenant_id' | 'created_at' | 'category_name'>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single()

      if (error) throw error

      setTransactions(prev => [data, ...prev])
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao adicionar' }
    }
  }

  return { transactions, loading, error, addTransaction }
}
