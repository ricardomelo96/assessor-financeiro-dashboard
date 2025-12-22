import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSummary } from '../useSummary'
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

describe('useSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return loading true initially', () => {
    vi.mocked(supabase.rpc).mockResolvedValue(mockRpcResponse([]))
    const { result } = renderHook(() => useSummary('5511999999999'))
    expect(result.current.loading).toBe(true)
  })

  it('should fetch and transform summary data', async () => {
    const mockSummary = [{
      total_income: '5000.00',
      total_expense: '1500.00',
      balance: '3500.00',
      transaction_count: 10,
      month_name: 'Dezembro'
    }]

    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce(mockRpcResponse(mockSummary))
      .mockResolvedValueOnce(mockRpcResponse([]))

    const { result } = renderHook(() => useSummary('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.summary).toEqual({
      total_income: 5000,
      total_expense: 1500,
      balance: 3500,
      transaction_count: 10,
      month_name: 'Dezembro'
    })
  })

  it('should handle RPC errors gracefully', async () => {
    // Supabase errors are thrown, so we mock a rejection with an Error object
    vi.mocked(supabase.rpc).mockRejectedValue(new Error('Database error'))

    const { result } = renderHook(() => useSummary('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Database error')
  })

  it('should keep loading true when tenantPhone is undefined (waiting for phone)', () => {
    const { result } = renderHook(() => useSummary(undefined))

    // Hook keeps loading=true while waiting for tenantPhone to be populated
    expect(result.current.loading).toBe(true)
    expect(supabase.rpc).not.toHaveBeenCalled()
    expect(result.current.error).toBeNull()
  })

  it('should convert string amounts to numbers', async () => {
    const mockData = [{
      total_income: '26000.50',
      total_expense: '15000.25',
      balance: '10999.25',
      transaction_count: 5,
      month_name: 'Janeiro'
    }]

    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce(mockRpcResponse(mockData))
      .mockResolvedValueOnce(mockRpcResponse([]))

    const { result } = renderHook(() => useSummary('5511999999999'))

    await waitFor(() => {
      expect(typeof result.current.summary?.total_income).toBe('number')
    })

    expect(result.current.summary?.total_income).toBe(26000.5)
    expect(result.current.summary?.total_expense).toBe(15000.25)
    expect(result.current.summary?.balance).toBe(10999.25)
  })

  it('should fetch historical data', async () => {
    const mockSummary = [{
      total_income: '5000',
      total_expense: '1500',
      balance: '3500',
      transaction_count: 10,
      month_name: 'Dezembro'
    }]

    const mockHistorical = [
      { month_name: 'Novembro', month_year: '2025-11-01', total_income: '4000', total_expense: '1200', balance: '2800', transaction_count: 8 },
      { month_name: 'Outubro', month_year: '2025-10-01', total_income: '3500', total_expense: '1000', balance: '2500', transaction_count: 6 }
    ]

    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce(mockRpcResponse(mockSummary))
      .mockResolvedValueOnce(mockRpcResponse(mockHistorical))

    const { result } = renderHook(() => useSummary('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.historical).toHaveLength(2)
    expect(result.current.historical[0]).toEqual({
      month_name: 'Novembro',
      month_year: '2025-11-01',
      total_income: 4000,
      total_expense: 1200,
      balance: 2800,
      transaction_count: 8
    })
  })

  it('should handle empty summary response', async () => {
    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce(mockRpcResponse([]))
      .mockResolvedValueOnce(mockRpcResponse([]))

    const { result } = renderHook(() => useSummary('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.summary).toBeNull()
    expect(result.current.historical).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should handle null values in data', async () => {
    const mockData = [{
      total_income: null,
      total_expense: null,
      balance: null,
      transaction_count: 0,
      month_name: 'Janeiro'
    }]

    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce(mockRpcResponse(mockData))
      .mockResolvedValueOnce(mockRpcResponse([]))

    const { result } = renderHook(() => useSummary('5511999999999'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.summary?.total_income).toBe(0)
    expect(result.current.summary?.total_expense).toBe(0)
    expect(result.current.summary?.balance).toBe(0)
  })
})
