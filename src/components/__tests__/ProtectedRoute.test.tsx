import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '../ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'

vi.mock('@/contexts/AuthContext')

const renderWithRouter = (
  ui: React.ReactElement,
  { initialEntries = ['/protected'] } = {}
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/protected"
          element={ui}
        />
      </Routes>
    </MemoryRouter>
  )
}

// Helper to create mock auth context
const createMockAuth = (overrides: Partial<ReturnType<typeof useAuth>> = {}) => ({
  user: null,
  session: null,
  loading: false,
  tenant: null,
  tenantPhone: undefined,
  authError: null,
  signOut: vi.fn(),
  ...overrides
})

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading spinner when auth is loading', () => {
    vi.mocked(useAuth).mockReturnValue(createMockAuth({ loading: true }))

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })

  it('should redirect to login when no user is authenticated', () => {
    vi.mocked(useAuth).mockReturnValue(createMockAuth())

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.queryByText('Carregando...')).not.toBeInTheDocument()
  })

  it('should render children when user is authenticated', () => {
    vi.mocked(useAuth).mockReturnValue(createMockAuth({
      user: { id: 'user-123', email: 'test@example.com' } as ReturnType<typeof useAuth>['user'],
      tenantPhone: '5511999999999'
    }))

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
    expect(screen.queryByText('Carregando...')).not.toBeInTheDocument()
  })

  it('should render multiple children when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue(createMockAuth({
      user: { id: 'user-123', email: 'test@example.com' } as ReturnType<typeof useAuth>['user'],
      tenantPhone: '5511999999999'
    }))

    renderWithRouter(
      <ProtectedRoute>
        <div>Content 1</div>
        <div>Content 2</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.getByText('Content 2')).toBeInTheDocument()
  })

  it('should preserve loading state while authentication is being checked', () => {
    vi.mocked(useAuth).mockReturnValue(createMockAuth({
      user: { id: 'user-123', email: 'test@example.com' } as ReturnType<typeof useAuth>['user'],
      loading: true,
      tenantPhone: '5511999999999'
    }))

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    // Even with a user, loading takes precedence
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should have proper loading spinner styling', () => {
    vi.mocked(useAuth).mockReturnValue(createMockAuth({ loading: true }))

    const { container } = renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    // Check for the loading spinner element with animation class
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('should redirect unauthenticated user trying to access nested protected route', () => {
    vi.mocked(useAuth).mockReturnValue(createMockAuth())

    render(
      <MemoryRouter initialEntries={['/dashboard/settings']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <div>Dashboard Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument()
  })
})
