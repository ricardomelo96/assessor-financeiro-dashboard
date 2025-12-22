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

describe('useReminders - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should categorize future reminder as pending', async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce(mockRpcResponse([
      {
        id: '1',
        tenant_id: 't1',
        title: 'Future Reminder',
        amount: '100',
        due_date: '2099-12-31', // Far future - always pending
        type: 'payable',
        is_paid: false,
        paid_at: null,
        category_id: null,
        category_name: null,
        days_until: 9999
      }
    ]))

    const { result } = renderHook(() =>
      useReminders('5511999999999')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.pendingReminders).toHaveLength(1)
    expect(result.current.overdueReminders).toHaveLength(0)
  })

  it('should categorize past unpaid reminder as overdue', async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce(mockRpcResponse([
      {
        id: '1',
        tenant_id: 't1',
        title: 'Past Due',
        amount: '100',
        due_date: '2020-01-01', // Far past - always overdue
        type: 'payable',
        is_paid: false,
        paid_at: null,
        category_id: null,
        category_name: null,
        days_until: -9999
      }
    ]))

    const { result } = renderHook(() =>
      useReminders('5511999999999')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.pendingReminders).toHaveLength(0)
    expect(result.current.overdueReminders).toHaveLength(1)
  })

  it('should categorize paid reminder regardless of due date', async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce(mockRpcResponse([
      {
        id: '1',
        tenant_id: 't1',
        title: 'Paid Late',
        amount: '100',
        due_date: '2020-01-01', // Past due but paid
        type: 'payable',
        is_paid: true,
        paid_at: '2020-01-15',
        category_id: null,
        category_name: null,
        days_until: -9999
      }
    ]))

    const { result } = renderHook(() =>
      useReminders('5511999999999')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.paidReminders).toHaveLength(1)
    expect(result.current.pendingReminders).toHaveLength(0)
    expect(result.current.overdueReminders).toHaveLength(0)
  })

  it('should map "receivable" type to "income"', async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce(mockRpcResponse([
      {
        id: '1',
        tenant_id: 't1',
        title: 'Client Payment',
        amount: '500',
        due_date: '2099-12-25',
        type: 'receivable',
        is_paid: false,
        paid_at: null,
        category_id: null,
        category_name: null,
        days_until: 9999
      }
    ]))

    const { result } = renderHook(() =>
      useReminders('5511999999999')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.reminders[0].type).toBe('income')
  })

  it('should map "payable" type to "expense"', async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce(mockRpcResponse([
      {
        id: '1',
        tenant_id: 't1',
        title: 'Electric Bill',
        amount: '200',
        due_date: '2025-12-25',
        type: 'payable',
        is_paid: false,
        paid_at: null,
        category_id: null,
        category_name: null,
        days_until: 3
      }
    ]))

    const { result } = renderHook(() =>
      useReminders('5511999999999')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.reminders[0].type).toBe('expense')
  })

  it('should handle null amount (preserves null - only string amounts are converted)', async () => {
    // Note: Unlike useTransactions which has a toNumber helper, useReminders
    // only converts string amounts. Null amounts pass through unchanged.
    vi.mocked(supabase.rpc).mockResolvedValueOnce(mockRpcResponse([
      {
        id: '1',
        tenant_id: 't1',
        title: 'No Amount',
        amount: null,
        due_date: '2099-12-25',
        type: 'payable',
        is_paid: false,
        paid_at: null,
        category_id: null,
        category_name: null,
        days_until: 9999
      }
    ]))

    const { result } = renderHook(() =>
      useReminders('5511999999999')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Null amounts are not converted to 0 in this hook
    expect(result.current.reminders[0].amount).toBeNull()
  })

  it('should handle reminders with all null optional fields', async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce(mockRpcResponse([
      {
        id: '1',
        tenant_id: 't1',
        title: 'Minimal Reminder',
        amount: '100',
        due_date: '2025-12-25',
        type: 'payable',
        is_paid: false,
        paid_at: null,
        category_id: null,
        category_name: null,
        days_until: 3
      }
    ]))

    const { result } = renderHook(() =>
      useReminders('5511999999999')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.reminders[0].category_id).toBeUndefined()
    expect(result.current.reminders[0].category_name).toBeUndefined()
    expect(result.current.reminders[0].paid_at).toBeUndefined()
  })

  it('should handle markAsPaid when tenantPhone is missing', async () => {
    const { result } = renderHook(() =>
      useReminders(undefined)
    )

    const markResult = await result.current.markAsPaid('Test Reminder')

    expect(markResult.success).toBe(false)
    expect(markResult.error).toContain('Telefone')
  })

  it('should update local state after successful markAsPaid', async () => {
    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce(mockRpcResponse([
        {
          id: '1',
          tenant_id: 't1',
          title: 'To Be Paid',
          amount: '100',
          due_date: '2025-12-25',
          type: 'payable',
          is_paid: false,
          paid_at: null,
          category_id: null,
          category_name: null,
          days_until: 3
        }
      ]))
      .mockResolvedValueOnce(mockRpcResponse({ success: true }))

    const { result } = renderHook(() =>
      useReminders('5511999999999')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.pendingReminders).toHaveLength(1)

    await result.current.markAsPaid('To Be Paid')

    await waitFor(() => {
      expect(result.current.reminders[0].is_paid).toBe(true)
    })
  })

  it('should handle multiple reminders with mixed states', async () => {
    vi.mocked(supabase.rpc).mockResolvedValueOnce(mockRpcResponse([
      { id: '1', tenant_id: 't1', title: 'Pending 1', amount: '100', due_date: '2025-12-25', type: 'payable', is_paid: false, paid_at: null, category_id: null, category_name: null, days_until: 3 },
      { id: '2', tenant_id: 't1', title: 'Pending 2', amount: '200', due_date: '2025-12-26', type: 'receivable', is_paid: false, paid_at: null, category_id: null, category_name: null, days_until: 4 },
      { id: '3', tenant_id: 't1', title: 'Paid 1', amount: '300', due_date: '2025-12-20', type: 'payable', is_paid: true, paid_at: '2025-12-20', category_id: null, category_name: null, days_until: -2 },
      { id: '4', tenant_id: 't1', title: 'Overdue 1', amount: '400', due_date: '2025-12-15', type: 'payable', is_paid: false, paid_at: null, category_id: null, category_name: null, days_until: -7 }
    ]))

    const { result } = renderHook(() =>
      useReminders('5511999999999')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.reminders).toHaveLength(4)
    expect(result.current.pendingReminders).toHaveLength(2)
    expect(result.current.paidReminders).toHaveLength(1)
    expect(result.current.overdueReminders).toHaveLength(1)
  })
})
