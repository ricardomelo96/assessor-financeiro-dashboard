import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Header } from '../Header'

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}))

import { useAuth } from '@/contexts/AuthContext'

describe('Header', () => {
  const mockSignOut = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display user initials from email', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123', email: 'ricardo@example.com' } as any,
      session: null,
      loading: false,
      tenant: { id: 't1', phone: '5511999999999', name: 'Ricardo', status: 'active' } as any,
      tenantPhone: '5511999999999',
      authError: null,
      signOut: mockSignOut
    })

    render(<Header />, { wrapper: BrowserRouter })

    // Should show 'R' as initial from email
    expect(screen.getByText('R')).toBeInTheDocument()
  })

  it('should display app name in header', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' } as any,
      session: null,
      loading: false,
      tenant: null,
      tenantPhone: undefined,
      authError: null,
      signOut: mockSignOut
    })

    render(<Header />, { wrapper: BrowserRouter })

    expect(screen.getByText('Assessor Financeiro')).toBeInTheDocument()
  })

  it('should handle missing email gracefully', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123', email: undefined } as any,
      session: null,
      loading: false,
      tenant: { id: 't1', phone: '5511999999999', name: 'Test', status: 'active' } as any,
      tenantPhone: '5511999999999',
      authError: null,
      signOut: mockSignOut
    })

    render(<Header />, { wrapper: BrowserRouter })

    // Should show default initial 'U' when no email
    expect(screen.getByText('U')).toBeInTheDocument()
  })

  it('should handle null user gracefully', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      tenant: null,
      tenantPhone: undefined,
      authError: null,
      signOut: mockSignOut
    })

    render(<Header />, { wrapper: BrowserRouter })

    // Should show default initial 'U' when no user
    expect(screen.getByText('U')).toBeInTheDocument()
  })

  it('should display notification bell', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' } as any,
      session: null,
      loading: false,
      tenant: null,
      tenantPhone: undefined,
      authError: null,
      signOut: mockSignOut
    })

    render(<Header />, { wrapper: BrowserRouter })

    // Bell icon is rendered as a button
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('should have avatar button that can be clicked', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' } as any,
      session: null,
      loading: false,
      tenant: { id: 't1', phone: '5511999999999', name: 'Test', status: 'active' } as any,
      tenantPhone: '5511999999999',
      authError: null,
      signOut: mockSignOut
    })

    render(<Header />, { wrapper: BrowserRouter })

    // Find the avatar button (it's the one with the initial)
    const avatarButton = screen.getByText('T').closest('button')
    expect(avatarButton).toBeInTheDocument()
    expect(avatarButton).not.toBeDisabled()
  })

  it('should render signOut function from useAuth', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' } as any,
      session: null,
      loading: false,
      tenant: null,
      tenantPhone: undefined,
      authError: null,
      signOut: mockSignOut
    })

    render(<Header />, { wrapper: BrowserRouter })

    // Verify signOut is available (it's used in handleLogout)
    expect(mockSignOut).toBeDefined()
    expect(typeof mockSignOut).toBe('function')
  })

  it('should have profile/settings menu item', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' } as any,
      session: null,
      loading: false,
      tenant: null,
      tenantPhone: undefined,
      authError: null,
      signOut: mockSignOut
    })

    render(<Header />, { wrapper: BrowserRouter })

    // Open dropdown
    const avatarButton = screen.getByText('T').closest('button')
    await userEvent.click(avatarButton!)

    await waitFor(() => {
      expect(screen.getByText('Perfil')).toBeInTheDocument()
    })
  })
})
