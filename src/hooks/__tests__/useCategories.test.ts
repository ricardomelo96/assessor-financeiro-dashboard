import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCategories } from '../useCategories'
import { supabase } from '@/lib/supabase'

vi.mock('@/lib/supabase')

// Helper to create properly typed mock responses
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockRpcResponse = <T>(data: T, error: { message: string } | null = null): any => ({
  data,
  error,
  count: null,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK'
})

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return loading true initially', () => {
    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce(mockRpcResponse([]))
      .mockResolvedValueOnce(mockRpcResponse([]))
    const { result } = renderHook(() => useCategories('5511999999999'))
    expect(result.current.loading).toBe(true)
  })

  it('should fetch and transform categories data', async () => {
    const mockCategories = [
      { category_id: 'cat-1', category_name: 'Alimentacao', category_type: 'expense', category_icon: 'utensils' },
      { category_id: 'cat-2', category_name: 'Salario', category_type: 'income', category_icon: 'briefcase' },
      { category_id: 'cat-3', category_name: 'Transporte', category_type: 'expense', category_icon: 'car' }
    ]

    const mockSpending = [
      { category_name: 'Alimentacao', total_spent: 500.50 },
      { category_name: 'Transporte', total_spent: 200.00 }
    ]

    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce(mockRpcResponse(mockCategories))
      .mockResolvedValueOnce(mockRpcResponse(mockSpending))

    const { result } = renderHook(() => useCategories('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.categories).toHaveLength(3)
    expect(result.current.categories[0]).toEqual({
      id: 'cat-1',
      name: 'Alimentacao',
      type: 'expense',
      icon: 'utensils',
      tenant_id: '',
      sort_order: 0
    })
  })

  it('should handle RPC errors gracefully', async () => {
    vi.mocked(supabase.rpc).mockRejectedValue(new Error('Database error'))

    const { result } = renderHook(() => useCategories('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Database error')
  })

  it('should not fetch when tenantPhone is undefined', async () => {
    const { result } = renderHook(() => useCategories(undefined))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(supabase.rpc).not.toHaveBeenCalled()
    expect(result.current.error).toContain('Telefone')
  })

  it('should separate income and expense categories', async () => {
    const mockCategories = [
      { category_id: 'cat-1', category_name: 'Alimentacao', category_type: 'expense', category_icon: 'utensils' },
      { category_id: 'cat-2', category_name: 'Salario', category_type: 'income', category_icon: 'briefcase' },
      { category_id: 'cat-3', category_name: 'Transporte', category_type: 'expense', category_icon: 'car' },
      { category_id: 'cat-4', category_name: 'Freelance', category_type: 'income', category_icon: 'laptop' }
    ]

    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce(mockRpcResponse(mockCategories))
      .mockResolvedValueOnce(mockRpcResponse([]))

    const { result } = renderHook(() => useCategories('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.incomeCategories).toHaveLength(2)
    expect(result.current.expenseCategories).toHaveLength(2)

    expect(result.current.incomeCategories.map(c => c.name)).toEqual(['Salario', 'Freelance'])
    expect(result.current.expenseCategories.map(c => c.name)).toEqual(['Alimentacao', 'Transporte'])
  })

  it('should fetch spending data', async () => {
    const mockCategories = [
      { category_id: 'cat-1', category_name: 'Alimentacao', category_type: 'expense', category_icon: 'utensils' }
    ]

    const mockSpending = [
      { category_name: 'Alimentacao', total_spent: 1500.75 }
    ]

    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce(mockRpcResponse(mockCategories))
      .mockResolvedValueOnce(mockRpcResponse(mockSpending))

    const { result } = renderHook(() => useCategories('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.spending).toHaveLength(1)
    expect(result.current.spending[0]).toEqual({
      category_name: 'Alimentacao',
      total_spent: 1500.75
    })
  })

  it('should handle empty categories response', async () => {
    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce(mockRpcResponse([]))
      .mockResolvedValueOnce(mockRpcResponse([]))

    const { result } = renderHook(() => useCategories('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.categories).toEqual([])
    expect(result.current.incomeCategories).toEqual([])
    expect(result.current.expenseCategories).toEqual([])
    expect(result.current.spending).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should handle null category data gracefully', async () => {
    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce(mockRpcResponse(null))
      .mockResolvedValueOnce(mockRpcResponse(null))

    const { result } = renderHook(() => useCategories('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.categories).toEqual([])
    expect(result.current.spending).toEqual([])
    expect(result.current.error).toBeNull()
  })
})
