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
      // Use RPC instead of direct query for better session handling
      const { data, error } = await supabase.rpc('get_my_tenant')

      if (error) {
        devError('[AuthContext] Error fetching tenant:', error)
        setAuthError(error.message)
        return
      }

      if (!data || data.length === 0) {
        devError('[AuthContext] No tenant found for user')
        setAuthError('Tenant nao encontrado. Entre em contato com o suporte.')
        return
      }

      const tenantData = data[0]
      devLog('[AuthContext] Tenant fetched:', tenantData?.id, 'phone:', tenantData?.phone)
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

    const initializeAuth = async () => {
      devLog('[AuthContext] Initializing auth...')
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          devError('[AuthContext] Error getting session:', error)
        }

        if (!mounted) return

        devLog('[AuthContext] Session found:', !!session?.user)
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchTenant(session.user.id)
        }
      } catch (error) {
        devError('[AuthContext] Exception initializing auth:', error)
      } finally {
        if (mounted) {
          devLog('[AuthContext] Setting loading to false')
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      devLog('[AuthContext] Auth state changed:', event)

      if (!mounted) return

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        try {
          await fetchTenant(session.user.id)
        } catch (error) {
          devError('[AuthContext] Error in onAuthStateChange:', error)
        }
      } else {
        setTenant(null)
      }

      setLoading(false)
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
