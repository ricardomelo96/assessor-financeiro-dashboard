import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from '../Dashboard'

// Mock all hooks from @/hooks index
vi.mock('@/hooks', () => ({
  useAuth: vi.fn(),
  useSummary: vi.fn(),
  useTransactions: vi.fn(),
  useReminders: vi.fn(),
  useToast: vi.fn(() => ({ toast: vi.fn() }))
}))

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />
}))

import { useAuth, useSummary, useTransactions, useReminders } from '@/hooks'

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123', email: 'test@test.com' } as any,
      session: null,
      loading: false,
      tenant: { id: 't1', phone: '5511999999999', name: 'Test', status: 'active' } as any,
      tenantPhone: '5511999999999',
      authError: null,
      signOut: vi.fn()
    })
  })

  it('should show loading state when data is being fetched', () => {
    vi.mocked(useSummary).mockReturnValue({
      summary: null,
      historical: [],
      loading: true,
      error: null
    })
    vi.mocked(useTransactions).mockReturnValue({
      transactions: [],
      loading: true,
      error: null,
      addTransaction: vi.fn()
    })
    vi.mocked(useReminders).mockReturnValue({
      reminders: [],
      pendingReminders: [],
      paidReminders: [],
      overdueReminders: [],
      loading: true,
      error: null,
      markAsPaid: vi.fn()
    })

    render(<Dashboard />, { wrapper: BrowserRouter })

    expect(screen.getByText(/carregando dados/i)).toBeInTheDocument()
  })

  it('should display summary cards with correct data', async () => {
    vi.mocked(useSummary).mockReturnValue({
      summary: {
        total_income: 5000,
        total_expense: 3000,
        balance: 2000,
        transaction_count: 10,
        month_name: 'Dezembro'
      },
      historical: [
        { month_name: 'Dezembro', month_year: '2025-12', total_income: 5000, total_expense: 3000, balance: 2000, transaction_count: 10 },
        { month_name: 'Novembro', month_year: '2025-11', total_income: 4500, total_expense: 2800, balance: 1700, transaction_count: 8 }
      ],
      loading: false,
      error: null
    })
    vi.mocked(useTransactions).mockReturnValue({
      transactions: [],
      loading: false,
      error: null,
      addTransaction: vi.fn()
    })
    vi.mocked(useReminders).mockReturnValue({
      reminders: [],
      pendingReminders: [],
      paidReminders: [],
      overdueReminders: [],
      loading: false,
      error: null,
      markAsPaid: vi.fn()
    })

    render(<Dashboard />, { wrapper: BrowserRouter })

    await waitFor(() => {
      // Check for summary card titles
      expect(screen.getByText('Receitas')).toBeInTheDocument()
      expect(screen.getByText('Despesas')).toBeInTheDocument()
      expect(screen.getByText('Saldo')).toBeInTheDocument()
    })
  })

  it('should display recent transactions', async () => {
    vi.mocked(useSummary).mockReturnValue({
      summary: { total_income: 1000, total_expense: 500, balance: 500, transaction_count: 2, month_name: 'Dez' },
      historical: [],
      loading: false,
      error: null
    })
    vi.mocked(useTransactions).mockReturnValue({
      transactions: [
        { id: '1', tenant_id: 't1', type: 'expense', amount: 100, description: 'Mercado', date: '2025-12-22', category_id: 'cat1', category_name: 'Alimentacao', created_at: '2025-12-22T10:00:00Z' },
        { id: '2', tenant_id: 't1', type: 'income', amount: 500, description: 'Salario', date: '2025-12-20', category_id: 'cat2', category_name: 'Renda', created_at: '2025-12-20T10:00:00Z' }
      ],
      loading: false,
      error: null,
      addTransaction: vi.fn()
    })
    vi.mocked(useReminders).mockReturnValue({
      reminders: [],
      pendingReminders: [],
      paidReminders: [],
      overdueReminders: [],
      loading: false,
      error: null,
      markAsPaid: vi.fn()
    })

    render(<Dashboard />, { wrapper: BrowserRouter })

    await waitFor(() => {
      expect(screen.getByText('Mercado')).toBeInTheDocument()
      expect(screen.getByText('Salario')).toBeInTheDocument()
    })
  })

  it('should display upcoming reminders', async () => {
    vi.mocked(useSummary).mockReturnValue({
      summary: { total_income: 1000, total_expense: 500, balance: 500, transaction_count: 2, month_name: 'Dez' },
      historical: [],
      loading: false,
      error: null
    })
    vi.mocked(useTransactions).mockReturnValue({
      transactions: [],
      loading: false,
      error: null,
      addTransaction: vi.fn()
    })
    vi.mocked(useReminders).mockReturnValue({
      reminders: [
        { id: '1', tenant_id: 't1', title: 'Conta de Luz', amount: 150, due_date: '2025-12-25', type: 'expense', is_paid: false }
      ],
      pendingReminders: [
        { id: '1', tenant_id: 't1', title: 'Conta de Luz', amount: 150, due_date: '2025-12-25', type: 'expense', is_paid: false }
      ],
      paidReminders: [],
      overdueReminders: [],
      loading: false,
      error: null,
      markAsPaid: vi.fn()
    })

    render(<Dashboard />, { wrapper: BrowserRouter })

    await waitFor(() => {
      expect(screen.getByText('Conta de Luz')).toBeInTheDocument()
    })
  })

  it('should handle empty data gracefully', async () => {
    vi.mocked(useSummary).mockReturnValue({
      summary: null,
      historical: [],
      loading: false,
      error: null
    })
    vi.mocked(useTransactions).mockReturnValue({
      transactions: [],
      loading: false,
      error: null,
      addTransaction: vi.fn()
    })
    vi.mocked(useReminders).mockReturnValue({
      reminders: [],
      pendingReminders: [],
      paidReminders: [],
      overdueReminders: [],
      loading: false,
      error: null,
      markAsPaid: vi.fn()
    })

    render(<Dashboard />, { wrapper: BrowserRouter })

    // Should not crash, page should still render
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument()
    })
  })

  it('should show loading when auth is loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: true,
      tenant: null,
      tenantPhone: undefined,
      authError: null,
      signOut: vi.fn()
    })
    vi.mocked(useSummary).mockReturnValue({
      summary: null,
      historical: [],
      loading: false,
      error: null
    })
    vi.mocked(useTransactions).mockReturnValue({
      transactions: [],
      loading: false,
      error: null,
      addTransaction: vi.fn()
    })
    vi.mocked(useReminders).mockReturnValue({
      reminders: [],
      pendingReminders: [],
      paidReminders: [],
      overdueReminders: [],
      loading: false,
      error: null,
      markAsPaid: vi.fn()
    })

    render(<Dashboard />, { wrapper: BrowserRouter })

    expect(screen.getByText(/carregando dados/i)).toBeInTheDocument()
  })

  it('should render header with correct title and description', async () => {
    vi.mocked(useSummary).mockReturnValue({
      summary: { total_income: 1000, total_expense: 500, balance: 500, transaction_count: 2, month_name: 'Dez' },
      historical: [],
      loading: false,
      error: null
    })
    vi.mocked(useTransactions).mockReturnValue({
      transactions: [],
      loading: false,
      error: null,
      addTransaction: vi.fn()
    })
    vi.mocked(useReminders).mockReturnValue({
      reminders: [],
      pendingReminders: [],
      paidReminders: [],
      overdueReminders: [],
      loading: false,
      error: null,
      markAsPaid: vi.fn()
    })

    render(<Dashboard />, { wrapper: BrowserRouter })

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument()
      expect(screen.getByText(/visão geral das suas finanças/i)).toBeInTheDocument()
    })
  })
})
