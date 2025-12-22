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

describe('useTransactions - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle null amount as 0', async () => {
    const mockData = [
      {
        id: 'tx-1',
        type: 'expense',
        amount: null,
        description: 'Test',
        date: '2025-12-22',
        category_id: 'cat-1',
        category_name: 'Food',
        category_icon: null,
        created_at: '2025-12-22T10:00:00Z'
      }
    ]

    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse(mockData))

    const { result } = renderHook(() =>
      useTransactions({ tenantPhone: '5511999999999' })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.transactions[0].amount).toBe(0)
  })

  it('should handle undefined amount as 0', async () => {
    const mockData = [
      {
        id: 'tx-1',
        type: 'expense',
        amount: undefined,
        description: 'Test',
        date: '2025-12-22',
        category_id: 'cat-1',
        category_name: 'Food',
        category_icon: null,
        created_at: '2025-12-22T10:00:00Z'
      }
    ]

    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse(mockData))

    const { result } = renderHook(() =>
      useTransactions({ tenantPhone: '5511999999999' })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.transactions[0].amount).toBe(0)
  })

  it('should handle empty response array', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse([]))

    const { result } = renderHook(() =>
      useTransactions({ tenantPhone: '5511999999999' })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.transactions).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should handle null response data', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse(null))

    const { result } = renderHook(() =>
      useTransactions({ tenantPhone: '5511999999999' })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.transactions).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should handle invalid string amount (NaN) as 0', async () => {
    const mockData = [
      {
        id: 'tx-1',
        type: 'expense',
        amount: 'invalid-not-a-number',
        description: 'Test',
        date: '2025-12-22',
        category_id: 'cat-1',
        category_name: 'Food',
        category_icon: null,
        created_at: '2025-12-22T10:00:00Z'
      }
    ]

    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse(mockData))

    const { result } = renderHook(() =>
      useTransactions({ tenantPhone: '5511999999999' })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.transactions[0].amount).toBe(0)
  })

  it('should handle RPC exception', async () => {
    vi.mocked(supabase.rpc).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() =>
      useTransactions({ tenantPhone: '5511999999999' })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
  })

  it('should handle addTransaction when tenantPhone is missing', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse([]))

    const { result } = renderHook(() =>
      useTransactions({ tenantPhone: undefined })
    )

    // Wait for initial state to settle
    await waitFor(() => {
      expect(result.current.loading).toBe(true)
    })

    const addResult = await result.current.addTransaction({
      type: 'expense',
      amount: 100,
      description: 'Test',
      category_id: 'cat-1',
      date: '2025-12-22'
    })

    expect(addResult.success).toBe(false)
    expect(addResult.error).toContain('Telefone')
  })

  it('should handle large numeric amounts', async () => {
    const mockData = [
      {
        id: 'tx-1',
        type: 'income',
        amount: '9999999.99',
        description: 'Large Amount',
        date: '2025-12-22',
        category_id: 'cat-1',
        category_name: 'Revenue',
        category_icon: null,
        created_at: '2025-12-22T10:00:00Z'
      }
    ]

    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse(mockData))

    const { result } = renderHook(() =>
      useTransactions({ tenantPhone: '5511999999999' })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.transactions[0].amount).toBe(9999999.99)
  })

  it('should handle decimal precision', async () => {
    const mockData = [
      {
        id: 'tx-1',
        type: 'expense',
        amount: '123.456789',
        description: 'Precise Amount',
        date: '2025-12-22',
        category_id: 'cat-1',
        category_name: 'Test',
        category_icon: null,
        created_at: '2025-12-22T10:00:00Z'
      }
    ]

    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse(mockData))

    const { result } = renderHook(() =>
      useTransactions({ tenantPhone: '5511999999999' })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.transactions[0].amount).toBe(123.456789)
  })
})
