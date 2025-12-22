import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RecentTransactions from '../RecentTransactions'

describe('RecentTransactions', () => {
  it('should render list of transactions', () => {
    const transactions = [
      { id: '1', description: 'Mercado', amount: 150, type: 'expense' as const, category: 'Alimentacao', date: '2025-12-22' },
      { id: '2', description: 'Salario', amount: 5000, type: 'income' as const, category: 'Renda', date: '2025-12-20' }
    ]

    render(<RecentTransactions transactions={transactions} />)

    expect(screen.getByText('Mercado')).toBeInTheDocument()
    expect(screen.getByText('Salario')).toBeInTheDocument()
  })

  it('should show empty state when no transactions', () => {
    render(<RecentTransactions transactions={[]} />)

    expect(screen.getByText(/nenhuma transacao recente/i)).toBeInTheDocument()
  })

  it('should show empty state when transactions is undefined', () => {
    render(<RecentTransactions transactions={undefined as any} />)

    expect(screen.getByText(/nenhuma transacao recente/i)).toBeInTheDocument()
  })

  it('should display transaction amount with correct prefix for expense', () => {
    const transactions = [
      { id: '1', description: 'Mercado', amount: 150, type: 'expense' as const, category: 'Alimentacao', date: '2025-12-22' }
    ]

    render(<RecentTransactions transactions={transactions} />)

    // Check for negative prefix on expense
    const cell = screen.getByRole('cell', { name: /-R\$\s*150/i })
    expect(cell).toBeInTheDocument()
  })

  it('should display transaction amount with correct prefix for income', () => {
    const transactions = [
      { id: '1', description: 'Salario', amount: 5000, type: 'income' as const, category: 'Renda', date: '2025-12-20' }
    ]

    render(<RecentTransactions transactions={transactions} />)

    // Check for positive prefix on income
    const cell = screen.getByRole('cell', { name: /\+R\$\s*5\.000/i })
    expect(cell).toBeInTheDocument()
  })

  it('should display category for each transaction', () => {
    const transactions = [
      { id: '1', description: 'Uber', amount: 25, type: 'expense' as const, category: 'Transporte', date: '2025-12-22' }
    ]

    render(<RecentTransactions transactions={transactions} />)

    expect(screen.getByText('Transporte')).toBeInTheDocument()
  })

  it('should display card title', () => {
    const transactions = [
      { id: '1', description: 'Test', amount: 100, type: 'expense' as const, category: 'Test', date: '2025-12-22' }
    ]

    render(<RecentTransactions transactions={transactions} />)

    expect(screen.getByText(/transacoes recentes/i)).toBeInTheDocument()
  })

  it('should display table headers', () => {
    const transactions = [
      { id: '1', description: 'Test', amount: 100, type: 'expense' as const, category: 'Test', date: '2025-12-22' }
    ]

    render(<RecentTransactions transactions={transactions} />)

    expect(screen.getByRole('columnheader', { name: /data/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /descrição/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /categoria/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /valor/i })).toBeInTheDocument()
  })

  it('should render multiple transactions in order', () => {
    const transactions = [
      { id: '1', description: 'First', amount: 100, type: 'expense' as const, category: 'A', date: '2025-12-22' },
      { id: '2', description: 'Second', amount: 200, type: 'income' as const, category: 'B', date: '2025-12-21' },
      { id: '3', description: 'Third', amount: 300, type: 'expense' as const, category: 'C', date: '2025-12-20' }
    ]

    render(<RecentTransactions transactions={transactions} />)

    const rows = screen.getAllByRole('row')
    // First row is header, rest are data rows
    expect(rows).toHaveLength(4) // 1 header + 3 data rows
  })
})
