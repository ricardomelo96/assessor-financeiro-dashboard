import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Category, CategorySpending } from '@/types'

export function useCategories(tenantPhone: string | undefined) {
  const [categories, setCategories] = useState<Category[]>([])
  const [spending, setSpending] = useState<CategorySpending[]>([])
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
        // Fetch categories
        const { data: catData, error: catError } = await supabase
          .rpc('get_categories_by_phone', { p_phone: tenantPhone })

        if (catError) throw catError

        const formattedCategories = catData?.map((c: any) => ({
          id: c.category_id,
          name: c.category_name,
          type: c.category_type,
          icon: c.category_icon,
          tenant_id: '',
          sort_order: 0
        })) || []

        setCategories(formattedCategories)

        // Fetch spending by category
        const { data: spendingData, error: spendingError } = await supabase
          .rpc('get_spending_by_category', {
            p_phone: tenantPhone,
            p_category_hint: null,
            p_month: null,
            p_year: null
          })

        if (spendingError) throw spendingError
        setSpending(spendingData || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar categorias')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tenantPhone])

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  return {
    categories,
    incomeCategories,
    expenseCategories,
    spending,
    loading,
    error
  }
}
