import { vi } from 'vitest'

export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    })),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
  rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
}

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  phone: '5511999999999',
}

export const mockTenant = {
  id: 'test-tenant-id',
  user_id: 'test-user-id',
  phone: '5511999999999',
  name: 'Test User',
  email: 'test@example.com',
  status: 'active',
  plan: 'pro',
}

export const mockSummary = {
  total_income: 5000,
  total_expense: 1500,
  balance: 3500,
  transaction_count: 10,
  month_name: 'Dezembro',
}

export const mockTransaction = {
  id: 'test-transaction-id',
  tenant_id: 'test-tenant-id',
  type: 'expense',
  amount: 100,
  description: 'Test transaction',
  category_id: 'test-category-id',
  category_name: 'Alimentação',
  date: '2025-12-19',
  created_at: '2025-12-19T00:00:00Z',
}

export const mockCategory = {
  id: 'test-category-id',
  tenant_id: 'test-tenant-id',
  name: 'Alimentação',
  type: 'expense',
  icon: '🍔',
  is_default: false,
  sort_order: 1,
}

export const mockBudget = {
  id: 'test-budget-id',
  tenant_id: 'test-tenant-id',
  category_id: 'test-category-id',
  category_name: 'Alimentação',
  monthly_limit: 500,
  current_spent: 300,
  month_year: '2025-12-01',
  alert_threshold: 0.8,
  alert_level: 'OK',
}

export const mockReminder = {
  id: 'test-reminder-id',
  tenant_id: 'test-tenant-id',
  title: 'Conta de Luz',
  amount: 150,
  due_date: '2025-12-25',
  is_paid: false,
  type: 'expense',
}
