import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BudgetProgress } from '../BudgetProgress'

describe('BudgetProgress', () => {
  it('renders category name and amounts', () => {
    render(
      <BudgetProgress
        category="Alimentacao"
        spent={350}
        limit={500}
        alertLevel="OK"
      />
    )

    expect(screen.getByText('Alimentacao')).toBeInTheDocument()
    expect(screen.getByText(/R\$ 350,00/)).toBeInTheDocument()
    expect(screen.getByText(/R\$ 500,00/)).toBeInTheDocument()
  })

  it('displays correct percentage', () => {
    render(
      <BudgetProgress
        category="Test"
        spent={250}
        limit={500}
        alertLevel="OK"
      />
    )

    expect(screen.getByText('50.0%')).toBeInTheDocument()
  })

  it('caps percentage at 100%', () => {
    render(
      <BudgetProgress
        category="Test"
        spent={600}
        limit={500}
        alertLevel="EXCEEDED"
      />
    )

    expect(screen.getByText('100.0%')).toBeInTheDocument()
  })

  it('does not show badge for OK status', () => {
    render(
      <BudgetProgress
        category="Test"
        spent={200}
        limit={500}
        alertLevel="OK"
      />
    )

    expect(screen.queryByText('ALERTA')).not.toBeInTheDocument()
    expect(screen.queryByText('EXCEDIDO')).not.toBeInTheDocument()
  })

  it('shows ALERTA badge for WARNING status', () => {
    render(
      <BudgetProgress
        category="Test"
        spent={450}
        limit={500}
        alertLevel="WARNING"
      />
    )

    expect(screen.getByText('ALERTA')).toBeInTheDocument()
  })

  it('shows EXCEDIDO badge for EXCEEDED status', () => {
    render(
      <BudgetProgress
        category="Test"
        spent={600}
        limit={500}
        alertLevel="EXCEEDED"
      />
    )

    expect(screen.getByText('EXCEDIDO')).toBeInTheDocument()
  })

  it('shows exceeded amount when over limit', () => {
    render(
      <BudgetProgress
        category="Test"
        spent={650}
        limit={500}
        alertLevel="EXCEEDED"
      />
    )

    expect(screen.getByText(/Excedido em R\$ 150,00/)).toBeInTheDocument()
  })

  it('does not show exceeded message when under limit', () => {
    render(
      <BudgetProgress
        category="Test"
        spent={400}
        limit={500}
        alertLevel="OK"
      />
    )

    expect(screen.queryByText(/Excedido em/)).not.toBeInTheDocument()
  })

  it('handles zero spent', () => {
    render(
      <BudgetProgress
        category="Test"
        spent={0}
        limit={500}
        alertLevel="OK"
      />
    )

    expect(screen.getByText('0.0%')).toBeInTheDocument()
    expect(screen.getByText(/R\$ 0,00/)).toBeInTheDocument()
  })

  it('handles decimal amounts', () => {
    render(
      <BudgetProgress
        category="Test"
        spent={333.33}
        limit={1000}
        alertLevel="OK"
      />
    )

    expect(screen.getByText('33.3%')).toBeInTheDocument()
    expect(screen.getByText(/R\$ 333,33/)).toBeInTheDocument()
  })
})
