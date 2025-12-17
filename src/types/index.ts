export interface Tenant {
  id: string
  phone: string
  name: string
  email?: string
  status: 'active' | 'suspended' | 'cancelled'
}

export interface Transaction {
  id: string
  tenant_id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category_id: string
  category_name?: string
  date: string
  created_at: string
}

export interface Category {
  id: string
  tenant_id: string
  name: string
  type: 'income' | 'expense'
  icon?: string
  sort_order: number
}

export interface Reminder {
  id: string
  tenant_id: string
  title: string
  amount: number
  due_date: string
  is_paid: boolean
  paid_at?: string
  category_id?: string
  category_name?: string
  type: 'income' | 'expense'
}

export interface MonthlySummary {
  total_income: number
  total_expense: number
  balance: number
  transaction_count: number
  month_name: string
}

export interface CategorySpending {
  category_id: string
  category_name: string
  total_spent: number
  percentage_of_total: number
  transaction_count: number
}

export interface Budget {
  id: string
  tenant_id: string
  category_id: string
  category_name: string
  monthly_limit: number
  current_spent: number
  month_year: string
  alert_threshold: number
  alert_level: 'OK' | 'WARNING' | 'EXCEEDED'
}

export interface HistoricalData {
  month_name: string
  month_year: string
  total_income: number
  total_expense: number
  balance: number
  transaction_count: number
}
