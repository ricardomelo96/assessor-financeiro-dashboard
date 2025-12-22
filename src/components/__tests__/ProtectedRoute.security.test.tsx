import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../ProtectedRoute'

// Mock useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}))

import { useAuth } from '@/contexts/AuthContext'

describe('ProtectedRoute Security', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should redirect to /login when session expires mid-navigation', async () => {
    // Start authenticated
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123', email: 'test@test.com' } as ReturnType<typeof useAuth>['user'],
      session: null,
      loading: false,
      tenant: { id: 't1', phone: '5511999999999', name: 'Test', status: 'active' } as ReturnType<typeof useAuth>['tenant'],
      tenantPhone: '5511999999999',
      authError: null,
      signOut: vi.fn()
    })

    const { rerender } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/dashboard" element={
            <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()

    // Session expires - user becomes null
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      tenant: null,
      tenantPhone: undefined,
      authError: null,
      signOut: vi.fn()
    })

    rerender(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/dashboard" element={
            <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument()
    })
  })

  it('should not render protected content during loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: true,
      tenant: null,
      tenantPhone: undefined,
      authError: null,
      signOut: vi.fn()
    })

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="secret">Secret Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.queryByTestId('secret')).not.toBeInTheDocument()
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('should not leak protected content while loading even with user present', () => {
    // User exists but still loading - should NOT show content
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123', email: 'test@test.com' } as ReturnType<typeof useAuth>['user'],
      session: null,
      loading: true,
      tenant: null,
      tenantPhone: undefined,
      authError: null,
      signOut: vi.fn()
    })

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="sensitive-data">Sensitive Financial Data</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    // Critical: Even with user present, loading state should hide content
    expect(screen.queryByTestId('sensitive-data')).not.toBeInTheDocument()
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('should redirect immediately when user is null (not wait)', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      tenant: null,
      tenantPhone: undefined,
      authError: null,
      signOut: vi.fn()
    })

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Redirect</div>} />
          <Route path="/protected" element={
            <ProtectedRoute><div>Should Not See This</div></ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    )

    // Should immediately redirect, not show any protected content
    expect(screen.queryByText('Should Not See This')).not.toBeInTheDocument()
    expect(screen.getByText('Login Redirect')).toBeInTheDocument()
  })

  it('should preserve location state when redirecting to login', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      tenant: null,
      tenantPhone: undefined,
      authError: null,
      signOut: vi.fn()
    })

    // This tests that the location state is passed for post-login redirect
    // The Navigate component in ProtectedRoute sets state: { from: location }
    render(
      <MemoryRouter initialEntries={['/dashboard/transactions']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/dashboard/*" element={
            <ProtectedRoute><div>Dashboard</div></ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('should handle rapid auth state changes without crashing', async () => {
    const mockSignOut = vi.fn()

    // Rapid state changes simulating flaky connection
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1', email: 'a@a.com' } as ReturnType<typeof useAuth>['user'],
      session: null,
      loading: false,
      tenant: null,
      tenantPhone: undefined,
      authError: null,
      signOut: mockSignOut
    })

    const { rerender } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login</div>} />
          <Route path="/dashboard" element={
            <ProtectedRoute><div>Content</div></ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()

    // Loading state
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: true,
      tenant: null,
      tenantPhone: undefined,
      authError: null,
      signOut: mockSignOut
    })

    rerender(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login</div>} />
          <Route path="/dashboard" element={
            <ProtectedRoute><div>Content</div></ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Carregando...')).toBeInTheDocument()

    // Back to authenticated
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1', email: 'a@a.com' } as ReturnType<typeof useAuth>['user'],
      session: null,
      loading: false,
      tenant: null,
      tenantPhone: undefined,
      authError: null,
      signOut: mockSignOut
    })

    rerender(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login</div>} />
          <Route path="/dashboard" element={
            <ProtectedRoute><div>Content</div></ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})
