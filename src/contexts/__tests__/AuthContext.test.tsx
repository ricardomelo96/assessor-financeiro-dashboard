import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      signOut: vi.fn()
    },
    rpc: vi.fn()
  }
}))

import { supabase } from '@/lib/supabase'

function TestComponent() {
  const { user, tenant, loading, authError } = useAuth()
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="user">{user?.id || 'none'}</div>
      <div data-testid="tenant">{tenant?.phone || 'none'}</div>
      <div data-testid="error">{authError || 'none'}</div>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should set loading=false and user=null when no session', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })

  it('should fetch tenant when session exists', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          user: { id: 'user-123' },
          access_token: 'token'
        }
      },
      error: null
    } as any)

    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: [{
        id: 'tenant-123',
        phone: '5511999999999',
        name: 'Test User',
        status: 'active'
      }],
      error: null
    } as any)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    expect(screen.getByTestId('tenant')).toHaveTextContent('5511999999999')
  })

  it('should show error when tenant not found', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          user: { id: 'user-123' },
          access_token: 'token'
        }
      },
      error: null
    } as any)

    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: [],
      error: null
    } as any)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(/Tenant nao encontrado/i)
    })
  })
})
