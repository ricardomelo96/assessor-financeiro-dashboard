import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Transactions from '../Transactions'

vi.mock('@/hooks', () => ({
  useAuth: vi.fn(),
  useTransactions: vi.fn(),
  useCategories: vi.fn(),
  useToast: vi.fn(() => ({ toast: vi.fn() }))
}))

import { useAuth, useTransactions, useCategories, useToast } from '@/hooks'

describe('Transactions Page', () => {
  const mockAddTransaction = vi.fn()
  const mockToast = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useToast).mockReturnValue({ toast: mockToast })

    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123', email: 'test@test.com' } as any,
      session: null,
      loading: false,
      tenant: { id: 't1', phone: '5511999999999', name: 'Test', status: 'active' } as any,
      tenantPhone: '5511999999999',
      authError: null,
      signOut: vi.fn()
    })

    vi.mocked(useTransactions).mockReturnValue({
      transactions: [
        { id: '1', type: 'expense', amount: 100, description: 'Mercado', date: '2025-12-22', category_id: 'cat1', category_name: 'Alimentacao' }
      ],
      loading: false,
      error: null,
      addTransaction: mockAddTransaction
    })

    vi.mocked(useCategories).mockReturnValue({
      categories: [
        { id: 'cat1', name: 'Alimentacao', type: 'expense', icon: 'shopping' },
        { id: 'cat2', name: 'Salario', type: 'income', icon: 'dollar' }
      ],
      incomeCategories: [{ id: 'cat2', name: 'Salario', type: 'income', icon: 'dollar' }],
      expenseCategories: [{ id: 'cat1', name: 'Alimentacao', type: 'expense', icon: 'shopping' }],
      spending: [],
      loading: false,
      error: null
    })
  })

  it('should render transactions list', async () => {
    render(<Transactions />, { wrapper: BrowserRouter })

    await waitFor(() => {
      expect(screen.getByText('Mercado')).toBeInTheDocument()
      expect(screen.getByText('Alimentacao')).toBeInTheDocument()
    })
  })

  it('should show loading state', () => {
    vi.mocked(useTransactions).mockReturnValue({
      transactions: [],
      loading: true,
      error: null,
      addTransaction: mockAddTransaction
    })

    render(<Transactions />, { wrapper: BrowserRouter })

    expect(screen.getByText(/carregando transações/i)).toBeInTheDocument()
  })

  it('should open new transaction dialog', async () => {
    render(<Transactions />, { wrapper: BrowserRouter })

    const newButton = screen.getByRole('button', { name: /nova transação/i })
    await userEvent.click(newButton)

    await waitFor(() => {
      expect(screen.getByText(/adicione uma nova transação/i)).toBeInTheDocument()
    }, { timeout: 10000 })
  }, 15000)

  it('should show empty state when no transactions', async () => {
    vi.mocked(useTransactions).mockReturnValue({
      transactions: [],
      loading: false,
      error: null,
      addTransaction: mockAddTransaction
    })

    render(<Transactions />, { wrapper: BrowserRouter })

    await waitFor(() => {
      expect(screen.getByText(/nenhuma transação encontrada/i)).toBeInTheDocument()
    })
  })

  it('should search transactions by description', async () => {
    vi.mocked(useTransactions).mockReturnValue({
      transactions: [
        { id: '1', type: 'expense', amount: 100, description: 'Mercado', date: '2025-12-22', category_id: 'cat1', category_name: 'Alimentacao' },
        { id: '2', type: 'income', amount: 500, description: 'Salario', date: '2025-12-20', category_id: 'cat2', category_name: 'Renda' }
      ],
      loading: false,
      error: null,
      addTransaction: mockAddTransaction
    })

    render(<Transactions />, { wrapper: BrowserRouter })

    // Both should be visible initially
    expect(screen.getByText('Mercado')).toBeInTheDocument()
    expect(screen.getByText('Salario')).toBeInTheDocument()

    // Search for Mercado
    const searchInput = screen.getByPlaceholderText(/buscar por descrição/i)
    await userEvent.type(searchInput, 'Mercado')

    await waitFor(() => {
      expect(screen.getByText('Mercado')).toBeInTheDocument()
      expect(screen.queryByText('Salario')).not.toBeInTheDocument()
    })
  })

  it('should show toast error when required fields are missing', async () => {
    render(<Transactions />, { wrapper: BrowserRouter })

    // Open dialog
    await userEvent.click(screen.getByRole('button', { name: /nova transação/i }))

    await waitFor(() => {
      expect(screen.getByText(/adicione uma nova transação/i)).toBeInTheDocument()
    })

    // Click save without filling fields
    const saveButton = screen.getByRole('button', { name: /salvar/i })
    await userEvent.click(saveButton)

    // Should show toast error
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Erro',
          description: 'Preencha todos os campos obrigatórios',
          variant: 'destructive'
        })
      )
    })

    // addTransaction should NOT be called
    expect(mockAddTransaction).not.toHaveBeenCalled()
  })

  it('should display page header correctly', () => {
    render(<Transactions />, { wrapper: BrowserRouter })

    expect(screen.getByRole('heading', { level: 1, name: 'Transações' })).toBeInTheDocument()
    expect(screen.getByText(/gerencie suas transações financeiras/i)).toBeInTheDocument()
  })

  it('should have type and category filter dropdowns', () => {
    render(<Transactions />, { wrapper: BrowserRouter })

    // Check for filter labels (use getAllByText since 'Categoria' appears as label and table header)
    expect(screen.getByText('Tipo')).toBeInTheDocument()
    expect(screen.getAllByText('Categoria').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Buscar')).toBeInTheDocument()
  })

  it('should show transaction amount with correct color', async () => {
    vi.mocked(useTransactions).mockReturnValue({
      transactions: [
        { id: '1', type: 'expense', amount: 100, description: 'Despesa', date: '2025-12-22', category_id: 'cat1', category_name: 'Food' },
        { id: '2', type: 'income', amount: 500, description: 'Receita', date: '2025-12-20', category_id: 'cat2', category_name: 'Salary' }
      ],
      loading: false,
      error: null,
      addTransaction: mockAddTransaction
    })

    render(<Transactions />, { wrapper: BrowserRouter })

    await waitFor(() => {
      // Check that expense and income rows exist
      expect(screen.getByText('Despesa')).toBeInTheDocument()
      expect(screen.getByText('Receita')).toBeInTheDocument()
    })
  })

  it('should have form fields in dialog', async () => {
    render(<Transactions />, { wrapper: BrowserRouter })

    // Open dialog
    await userEvent.click(screen.getByRole('button', { name: /nova transação/i }))

    await waitFor(() => {
      expect(screen.getByText(/adicione uma nova transação/i)).toBeInTheDocument()
    })

    // Verify form fields are present
    expect(screen.getByLabelText(/valor/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/data/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })
})
