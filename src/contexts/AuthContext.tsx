import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Tenant } from '@/types'

// Development-only logging
const isDev = import.meta.env.DEV
const devLog = (...args: unknown[]): void => { if (isDev) console.log(...args) }
const devError = (...args: unknown[]): void => { if (isDev) console.error(...args) }

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  tenant: Tenant | null
  tenantPhone: string | undefined
  authError: string | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  // Ref to prevent duplicate fetchTenant calls (race condition fix)
  const fetchingRef = useRef(false)
  const lastUserIdRef = useRef<string | null>(null)

  const fetchTenant = async (userId: string): Promise<void> => {
    // Prevent duplicate calls for same user
    if (fetchingRef.current && lastUserIdRef.current === userId) {
      devLog('[AuthContext] Fetch already in progress for this user, skipping')
      return
    }

    fetchingRef.current = true
    lastUserIdRef.current = userId
    setAuthError(null)

    devLog('[AuthContext] Fetching tenant for user:', userId)

    try {
      // Call RPC with timeout to avoid hanging
      devLog('[AuthContext] Calling get_my_tenant RPC...')

      const rpcPromise = supabase.rpc('get_my_tenant')
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('RPC timeout after 10 seconds')), 10000)
      )

      const { data, error } = await Promise.race([rpcPromise, timeoutPromise]) as Awaited<typeof rpcPromise>

      devLog('[AuthContext] get_my_tenant response:', { data, error, dataLength: data?.length })

      if (error) {
        devError('[AuthContext] Error fetching tenant:', error)
        setAuthError(error.message)
        return
      }

      if (!data || data.length === 0) {
        devError('[AuthContext] No tenant found for user - auth.uid() may be returning NULL')
        devError('[AuthContext] This usually means the JWT token is not being sent with the request')
        setAuthError('Tenant nao encontrado. Entre em contato com o suporte.')
        return
      }

      const tenantData = data[0]
      devLog('[AuthContext] Tenant fetched successfully:', tenantData?.id, 'phone:', tenantData?.phone)
      setTenant(tenantData as Tenant)
      setAuthError(null)
    } catch (error) {
      devError('[AuthContext] Exception fetching tenant:', error)
      setAuthError(error instanceof Error ? error.message : 'Erro ao carregar dados do usuario')
    } finally {
      fetchingRef.current = false
    }
  }

  useEffect(() => {
    let mounted = true

    // Safety timeout - ensure loading is set to false after 10 seconds max
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        devError('[AuthContext] Safety timeout reached, forcing loading to false')
        setLoading(false)
        setAuthError('Timeout ao carregar autenticacao. Tente recarregar a pagina.')
      }
    }, 10000)

    // Listen for auth changes - this is the source of truth for authentication state
    // We rely on onAuthStateChange for ALL auth state, including initial session
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      devLog('[AuthContext] Auth state changed:', event, 'user:', session?.user?.id)

      if (!mounted) return

      setSession(session)
      setUser(session?.user ?? null)

      // Only fetch tenant on INITIAL_SESSION or SIGNED_IN after initial load
      // SIGNED_IN fires before INITIAL_SESSION and the session may not be fully ready
      // So we skip SIGNED_IN if we're still in initial loading state
      const shouldFetchTenant = session?.user && (
        event === 'INITIAL_SESSION' ||
        event === 'TOKEN_REFRESHED' ||
        (event === 'SIGNED_IN' && !loading) // Only on SIGNED_IN if not initial load
      )

      if (shouldFetchTenant) {
        devLog('[AuthContext] Fetching tenant for event:', event)
        devLog('[AuthContext] Session access_token (first 50 chars):', session.access_token?.substring(0, 50))

        try {
          await fetchTenant(session.user.id)
        } catch (error) {
          devError('[AuthContext] Error fetching tenant:', error)
          setAuthError('Erro ao carregar dados do usuario. Tente fazer logout e login novamente.')
        }
      } else if (session?.user) {
        devLog('[AuthContext] Skipping tenant fetch for event:', event, '(waiting for INITIAL_SESSION)')
      } else {
        devLog('[AuthContext] No user in session, clearing tenant')
        setTenant(null)
      }

      if (mounted) {
        devLog('[AuthContext] Setting loading to false after event:', event)
        setLoading(false)
        clearTimeout(safetyTimeout)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    devLog('[AuthContext] Signing out...')
    try {
      await supabase.auth.signOut()
    } catch (error) {
      devError('[AuthContext] Error signing out:', error)
    }
    setUser(null)
    setSession(null)
    setTenant(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, tenant, tenantPhone: tenant?.phone, authError, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
