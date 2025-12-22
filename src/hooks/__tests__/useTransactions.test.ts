import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useTransactions } from '../useTransactions'
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

describe('useTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return loading true initially', () => {
    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse([]))
    const { result } = renderHook(() => useTransactions({ tenantPhone: '5511999999999' }))
    expect(result.current.loading).toBe(true)
  })

  it('should fetch and transform transactions data', async () => {
    const mockTransactions = [
      {
        id: 'tx-1',
        type: 'expense',
        amount: '150.50',
        description: 'Supermercado',
        date: '2025-12-15',
        category_id: 'cat-1',
        category_name: 'Alimentacao',
        category_icon: 'utensils',
        created_at: '2025-12-15T10:00:00Z'
      },
      {
        id: 'tx-2',
        type: 'income',
        amount: '5000',
        description: 'Salario',
        date: '2025-12-01',
        category_id: 'cat-2',
        category_name: 'Salario',
        category_icon: 'briefcase',
        created_at: '2025-12-01T08:00:00Z'
      }
    ]

    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse(mockTransactions))

    const { result } = renderHook(() => useTransactions({ tenantPhone: '5511999999999' }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.transactions).toHaveLength(2)
    expect(result.current.transactions[0]).toEqual({
      id: 'tx-1',
      tenant_id: '',
      type: 'expense',
      amount: 150.5,
      description: 'Supermercado',
      date: '2025-12-15',
      category_id: 'cat-1',
      category_name: 'Alimentacao',
      created_at: '2025-12-15T10:00:00Z'
    })
  })

  it('should handle RPC errors gracefully', async () => {
    vi.mocked(supabase.rpc).mockRejectedValue(new Error('Database error'))

    const { result } = renderHook(() => useTransactions({ tenantPhone: '5511999999999' }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Database error')
  })

  it('should not fetch when tenantPhone is undefined', async () => {
    const { result } = renderHook(() => useTransactions({ tenantPhone: undefined }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(supabase.rpc).not.toHaveBeenCalled()
    expect(result.current.error).toContain('Telefone')
  })

  it('should convert string amounts to numbers', async () => {
    const mockData = [
      {
        id: 'tx-1',
        type: 'expense',
        amount: '1234.56',
        description: 'Test',
        date: '2025-12-15',
        category_id: 'cat-1',
        category_name: 'Test',
        category_icon: null,
        created_at: '2025-12-15T10:00:00Z'
      }
    ]

    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse(mockData))

    const { result } = renderHook(() => useTransactions({ tenantPhone: '5511999999999' }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(typeof result.current.transactions[0].amount).toBe('number')
    expect(result.current.transactions[0].amount).toBe(1234.56)
  })

  it('should use default category name when null', async () => {
    const mockData = [
      {
        id: 'tx-1',
        type: 'expense',
        amount: '100',
        description: 'Test',
        date: '2025-12-15',
        category_id: 'cat-1',
        category_name: null,
        category_icon: null,
        created_at: '2025-12-15T10:00:00Z'
      }
    ]

    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse(mockData))

    const { result } = renderHook(() => useTransactions({ tenantPhone: '5511999999999' }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.transactions[0].category_name).toBe('Sem categoria')
  })

  it('should respect limit parameter', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse([]))

    renderHook(() => useTransactions({ tenantPhone: '5511999999999', limit: 10 }))

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('get_transactions_by_phone', {
        p_phone: '5511999999999',
        p_limit: 10
      })
    })
  })

  it('should use default limit of 50 when not specified', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse([]))

    renderHook(() => useTransactions({ tenantPhone: '5511999999999' }))

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('get_transactions_by_phone', {
        p_phone: '5511999999999',
        p_limit: 50
      })
    })
  })
})
