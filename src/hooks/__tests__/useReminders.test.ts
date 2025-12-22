import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useReminders } from '../useReminders'
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

describe('useReminders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return loading true initially', () => {
    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse([]))
    const { result } = renderHook(() => useReminders('5511999999999'))
    expect(result.current.loading).toBe(true)
  })

  it('should fetch and transform reminders data', async () => {
    const mockReminders = [
      {
        id: 'rem-1',
        tenant_id: 'tenant-1',
        title: 'Conta de Luz',
        amount: '150.00',
        due_date: '2025-12-20',
        type: 'payable',
        is_paid: false,
        paid_at: null,
        category_id: 'cat-1',
        category_name: 'Contas',
        days_until: 5
      },
      {
        id: 'rem-2',
        tenant_id: 'tenant-1',
        title: 'Salario',
        amount: '5000.00',
        due_date: '2025-12-05',
        type: 'receivable',
        is_paid: true,
        paid_at: '2025-12-05T10:00:00Z',
        category_id: 'cat-2',
        category_name: 'Salario',
        days_until: -10
      }
    ]

    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse(mockReminders))

    const { result } = renderHook(() => useReminders('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.reminders).toHaveLength(2)
    expect(result.current.reminders[0]).toEqual({
      id: 'rem-1',
      tenant_id: 'tenant-1',
      title: 'Conta de Luz',
      amount: 150,
      due_date: '2025-12-20',
      type: 'expense',
      is_paid: false,
      paid_at: undefined,
      category_id: 'cat-1',
      category_name: 'Contas'
    })
  })

  it('should handle RPC errors gracefully', async () => {
    vi.mocked(supabase.rpc).mockRejectedValue(new Error('Database error'))

    const { result } = renderHook(() => useReminders('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Database error')
  })

  it('should not fetch when tenantPhone is undefined', async () => {
    const { result } = renderHook(() => useReminders(undefined))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(supabase.rpc).not.toHaveBeenCalled()
    expect(result.current.error).toContain('Telefone')
  })

  it('should convert string amounts to numbers', async () => {
    const mockData = [
      {
        id: 'rem-1',
        tenant_id: 'tenant-1',
        title: 'Test',
        amount: '1234.56',
        due_date: '2025-12-20',
        type: 'payable',
        is_paid: false,
        paid_at: null,
        category_id: null,
        category_name: null,
        days_until: 5
      }
    ]

    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse(mockData))

    const { result } = renderHook(() => useReminders('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(typeof result.current.reminders[0].amount).toBe('number')
    expect(result.current.reminders[0].amount).toBe(1234.56)
  })

  it('should map receivable type to income', async () => {
    const mockData = [
      {
        id: 'rem-1',
        tenant_id: 'tenant-1',
        title: 'Salario',
        amount: '5000',
        due_date: '2025-12-05',
        type: 'receivable',
        is_paid: false,
        paid_at: null,
        category_id: null,
        category_name: null,
        days_until: -10
      }
    ]

    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse(mockData))

    const { result } = renderHook(() => useReminders('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.reminders[0].type).toBe('income')
  })

  it('should map payable type to expense', async () => {
    const mockData = [
      {
        id: 'rem-1',
        tenant_id: 'tenant-1',
        title: 'Conta',
        amount: '100',
        due_date: '2025-12-20',
        type: 'payable',
        is_paid: false,
        paid_at: null,
        category_id: null,
        category_name: null,
        days_until: 5
      }
    ]

    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse(mockData))

    const { result } = renderHook(() => useReminders('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.reminders[0].type).toBe('expense')
  })

  it('should correctly categorize pending reminders', async () => {
    // Use dates far in the future and past to ensure consistent behavior
    const futureDate = '2099-12-31'
    const pastDate = '2020-01-01'

    const mockData = [
      { id: '1', tenant_id: 't1', title: 'Future', amount: '100', due_date: futureDate, type: 'payable', is_paid: false, paid_at: null, category_id: null, category_name: null, days_until: 5 },
      { id: '2', tenant_id: 't1', title: 'Paid', amount: '100', due_date: pastDate, type: 'payable', is_paid: true, paid_at: pastDate, category_id: null, category_name: null, days_until: -5 },
      { id: '3', tenant_id: 't1', title: 'Overdue', amount: '100', due_date: pastDate, type: 'payable', is_paid: false, paid_at: null, category_id: null, category_name: null, days_until: -5 }
    ]

    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse(mockData))

    const { result } = renderHook(() => useReminders('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.pendingReminders).toHaveLength(1)
    expect(result.current.pendingReminders[0].title).toBe('Future')

    expect(result.current.paidReminders).toHaveLength(1)
    expect(result.current.paidReminders[0].title).toBe('Paid')

    expect(result.current.overdueReminders).toHaveLength(1)
    expect(result.current.overdueReminders[0].title).toBe('Overdue')
  })

  it('should handle empty reminders response', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse([]))

    const { result } = renderHook(() => useReminders('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.reminders).toEqual([])
    expect(result.current.pendingReminders).toEqual([])
    expect(result.current.paidReminders).toEqual([])
    expect(result.current.overdueReminders).toEqual([])
    expect(result.current.error).toBeNull()
  })
})
