import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Transaction } from '@/types'

interface UseTransactionsOptions {
  tenantPhone?: string
  limit?: number
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
        let query = supabase
          .from('transactions')
          .select(`
            id,
            tenant_id,
            type,
            amount,
            description,
            category_id,
            date,
            created_at,
            categories (name)
          `)
          .order('date', { ascending: false })

        if (limit) {
          query = query.limit(limit)
        }

        const { data, error: fetchError } = await query

        if (fetchError) throw fetchError

        const formattedData = data?.map(t => ({
          ...t,
          category_name: t.categories?.name || 'Sem categoria'
        })) || []

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
