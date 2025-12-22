import { useState, useEffect, useCallback } from 'react'
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
      setError('Telefone do tenant nao disponivel. Faca login novamente.')
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

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'tenant_id' | 'created_at' | 'category_name'>) => {
    if (!tenantPhone) {
      return { success: false, error: 'Telefone do tenant não disponível' }
    }

    try {
      const { data, error } = await supabase
        .rpc('create_transaction_from_dashboard', {
          p_phone: tenantPhone,
          p_type: transaction.type,
          p_amount: transaction.amount,
          p_description: transaction.description,
          p_category_id: transaction.category_id,
          p_date: transaction.date,
        })

      if (error) throw error

      const result = data?.[0]
      if (!result?.success) {
        throw new Error(result?.message || 'Erro ao criar transação')
      }

      // Reload transactions to get the new one with category name
      window.location.reload()
      return { success: true, data: result }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao adicionar' }
    }
  }, [tenantPhone])

  return { transactions, loading, error, addTransaction }
}
