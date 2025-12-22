import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import TrendChart from '../TrendChart'

// Mock recharts - it doesn't render well in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />
}))

describe('TrendChart', () => {
  it('should render chart container with data', () => {
    const data = [
      { month_name: 'Jan', total_income: 5000, total_expense: 3000 },
      { month_name: 'Feb', total_income: 5500, total_expense: 3200 }
    ]

    render(<TrendChart data={data} />)

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('should show empty state when no data', () => {
    render(<TrendChart data={[]} />)

    expect(screen.getByText(/sem dados de historico/i)).toBeInTheDocument()
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument()
  })

  it('should show empty state when data is undefined', () => {
    render(<TrendChart data={undefined as any} />)

    expect(screen.getByText(/sem dados de historico/i)).toBeInTheDocument()
  })

  it('should render with historical data', () => {
    const historicalData = [
      { month_name: 'Out', total_income: 4000, total_expense: 2500 },
      { month_name: 'Nov', total_income: 4500, total_expense: 2800 },
      { month_name: 'Dez', total_income: 5000, total_expense: 3000 }
    ]

    render(<TrendChart data={historicalData} />)

    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('should display chart title', () => {
    const data = [
      { month_name: 'Jan', total_income: 5000, total_expense: 3000 }
    ]

    render(<TrendChart data={data} />)

    expect(screen.getByText(/tendencia de receitas e despesas/i)).toBeInTheDocument()
  })

  it('should render chart components', () => {
    const data = [
      { month_name: 'Jan', total_income: 5000, total_expense: 3000 }
    ]

    render(<TrendChart data={data} />)

    expect(screen.getByTestId('grid')).toBeInTheDocument()
    expect(screen.getByTestId('x-axis')).toBeInTheDocument()
    expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    expect(screen.getByTestId('legend')).toBeInTheDocument()
  })
})
