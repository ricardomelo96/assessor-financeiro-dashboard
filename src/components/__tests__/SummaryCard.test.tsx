import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SummaryCard from '../SummaryCard'

describe('SummaryCard', () => {
  it('renders income card with title and value', () => {
    render(<SummaryCard title="Receitas" value={5000} trend={10} type="income" />)

    expect(screen.getByText('Receitas')).toBeInTheDocument()
    expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument()
  })

  it('renders expense card with title and value', () => {
    render(<SummaryCard title="Despesas" value={3000} trend={-5} type="expense" />)

    expect(screen.getByText('Despesas')).toBeInTheDocument()
    expect(screen.getByText('R$ 3.000,00')).toBeInTheDocument()
  })

  it('renders balance card', () => {
    render(<SummaryCard title="Saldo" value={2000} trend={0} type="balance" />)

    expect(screen.getByText('Saldo')).toBeInTheDocument()
    expect(screen.getByText('R$ 2.000,00')).toBeInTheDocument()
  })

  it('displays positive trend with + prefix', () => {
    render(<SummaryCard title="Receitas" value={5000} trend={10.5} type="income" />)

    expect(screen.getByText('+10.5% em relação ao mês anterior')).toBeInTheDocument()
  })

  it('displays negative trend without + prefix', () => {
    render(<SummaryCard title="Despesas" value={3000} trend={-5.2} type="expense" />)

    expect(screen.getByText('-5.2% em relação ao mês anterior')).toBeInTheDocument()
  })

  it('formats large numbers correctly', () => {
    render(<SummaryCard title="Test" value={1000000} trend={0} type="income" />)

    expect(screen.getByText('R$ 1.000.000,00')).toBeInTheDocument()
  })

  it('handles zero values', () => {
    render(<SummaryCard title="Saldo" value={0} trend={0} type="balance" />)

    expect(screen.getByText('R$ 0,00')).toBeInTheDocument()
    expect(screen.getByText('+0.0% em relação ao mês anterior')).toBeInTheDocument()
  })

  it('handles negative balance', () => {
    render(<SummaryCard title="Saldo" value={-500} trend={-10} type="balance" />)

    expect(screen.getByText('-R$ 500,00')).toBeInTheDocument()
  })
})
