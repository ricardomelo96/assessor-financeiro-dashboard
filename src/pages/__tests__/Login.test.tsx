import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from '../Login'

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn()
    }
  }
}))

// Mock navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

import { supabase } from '@/lib/supabase'

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render login form with email and password fields', () => {
    render(<Login />, { wrapper: BrowserRouter })

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('should require email and password fields', () => {
    render(<Login />, { wrapper: BrowserRouter })

    // HTML5 validation should prevent submission
    expect(screen.getByLabelText(/email/i)).toBeRequired()
    expect(screen.getByLabelText(/senha/i)).toBeRequired()
  })

  it('should call signInWithPassword with correct credentials', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: { id: '123' } as any, session: { access_token: 'token' } as any },
      error: null
    })

    render(<Login />, { wrapper: BrowserRouter })

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/senha/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  it('should show error message on invalid credentials', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' } as any
    })

    render(<Login />, { wrapper: BrowserRouter })

    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@example.com')
    await userEvent.type(screen.getByLabelText(/senha/i), 'wrongpassword')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument()
    })
  })

  it('should navigate to dashboard on successful login', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: { id: '123' } as any, session: { access_token: 'token' } as any },
      error: null
    })

    render(<Login />, { wrapper: BrowserRouter })

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/senha/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should disable form during submission', async () => {
    // Delay the response to test loading state
    vi.mocked(supabase.auth.signInWithPassword).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        data: { user: { id: '123' } as any, session: {} as any },
        error: null
      }), 100))
    )

    render(<Login />, { wrapper: BrowserRouter })

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/senha/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /entrar/i })
    await userEvent.click(submitButton)

    // Button should be disabled during loading
    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/entrando/i)).toBeInTheDocument()
  })

  it('should show signup link', () => {
    render(<Login />, { wrapper: BrowserRouter })

    const signupLink = screen.getByRole('link', { name: /cadastre-se/i })
    expect(signupLink).toBeInTheDocument()
    expect(signupLink).toHaveAttribute('href', '/signup')
  })

  it('should disable inputs while loading', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        data: { user: { id: '123' } as any, session: {} as any },
        error: null
      }), 200))
    )

    render(<Login />, { wrapper: BrowserRouter })

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/senha/i)

    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.type(passwordInput, 'password123')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    // Inputs should be disabled during loading
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
  })
})
