import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useBudgets } from '../useBudgets'
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

describe('useBudgets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return loading true initially', () => {
    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse([]))
    const { result } = renderHook(() => useBudgets('5511999999999'))
    expect(result.current.loading).toBe(true)
  })

  it('should fetch and transform budgets data', async () => {
    const mockBudgets = [
      {
        id: 'budget-1',
        tenant_id: 'tenant-1',
        category_id: 'cat-1',
        category_name: 'Alimentacao',
        monthly_limit: '500.00',
        current_spent: '350.75',
        month_year: '2025-12',
        alert_threshold: '0.8',
        alert_level: 'WARNING'
      },
      {
        id: 'budget-2',
        tenant_id: 'tenant-1',
        category_id: 'cat-2',
        category_name: 'Transporte',
        monthly_limit: '300.00',
        current_spent: '150.00',
        month_year: '2025-12',
        alert_threshold: '0.8',
        alert_level: 'OK'
      }
    ]

    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse(mockBudgets))

    const { result } = renderHook(() => useBudgets('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.budgets).toHaveLength(2)
    expect(result.current.budgets[0]).toEqual({
      id: 'budget-1',
      tenant_id: 'tenant-1',
      category_id: 'cat-1',
      category_name: 'Alimentacao',
      monthly_limit: 500,
      current_spent: 350.75,
      month_year: '2025-12',
      alert_threshold: 0.8,
      alert_level: 'WARNING'
    })
  })

  it('should handle RPC errors gracefully', async () => {
    vi.mocked(supabase.rpc).mockRejectedValue(new Error('Database error'))

    const { result } = renderHook(() => useBudgets('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Database error')
  })

  it('should keep loading true when tenantPhone is undefined (waiting for phone)', () => {
    const { result } = renderHook(() => useBudgets(undefined))

    // Hook keeps loading=true while waiting for tenantPhone to be populated
    expect(result.current.loading).toBe(true)
    expect(supabase.rpc).not.toHaveBeenCalled()
    expect(result.current.error).toBeNull()
  })

  it('should convert string amounts to numbers', async () => {
    const mockData = [
      {
        id: 'budget-1',
        tenant_id: 'tenant-1',
        category_id: 'cat-1',
        category_name: 'Test',
        monthly_limit: '1000.50',
        current_spent: '500.25',
        month_year: '2025-12',
        alert_threshold: '0.75',
        alert_level: 'OK'
      }
    ]

    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse(mockData))

    const { result } = renderHook(() => useBudgets('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(typeof result.current.budgets[0].monthly_limit).toBe('number')
    expect(typeof result.current.budgets[0].current_spent).toBe('number')
    expect(typeof result.current.budgets[0].alert_threshold).toBe('number')
    expect(result.current.budgets[0].monthly_limit).toBe(1000.5)
    expect(result.current.budgets[0].current_spent).toBe(500.25)
    expect(result.current.budgets[0].alert_threshold).toBe(0.75)
  })

  it('should handle empty budgets response', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse([]))

    const { result } = renderHook(() => useBudgets('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.budgets).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should correctly map alert_level types', async () => {
    const mockData = [
      { id: '1', tenant_id: 't1', category_id: 'c1', category_name: 'A', monthly_limit: '100', current_spent: '50', month_year: '2025-12', alert_threshold: '0.8', alert_level: 'OK' },
      { id: '2', tenant_id: 't1', category_id: 'c2', category_name: 'B', monthly_limit: '100', current_spent: '85', month_year: '2025-12', alert_threshold: '0.8', alert_level: 'WARNING' },
      { id: '3', tenant_id: 't1', category_id: 'c3', category_name: 'C', monthly_limit: '100', current_spent: '120', month_year: '2025-12', alert_threshold: '0.8', alert_level: 'EXCEEDED' }
    ]

    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse(mockData))

    const { result } = renderHook(() => useBudgets('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.budgets[0].alert_level).toBe('OK')
    expect(result.current.budgets[1].alert_level).toBe('WARNING')
    expect(result.current.budgets[2].alert_level).toBe('EXCEEDED')
  })
})
