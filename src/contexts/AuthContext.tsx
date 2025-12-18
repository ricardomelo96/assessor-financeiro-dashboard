import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Tenant } from '@/types'

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
      console.log('[AuthContext] Fetch already in progress for this user, skipping')
      return
    }

    fetchingRef.current = true
    lastUserIdRef.current = userId
    setAuthError(null)

    console.log('[AuthContext] Fetching tenant for user:', userId)
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('[AuthContext] Error fetching tenant:', error)
        setAuthError(error.message)
        return
      }

      console.log('[AuthContext] Tenant fetched:', data?.id)
      setTenant(data as Tenant)
      setAuthError(null)
    } catch (error) {
      console.error('[AuthContext] Exception fetching tenant:', error)
      setAuthError(error instanceof Error ? error.message : 'Erro ao carregar dados do usuario')
    } finally {
      fetchingRef.current = false
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      console.log('[AuthContext] Initializing auth...')
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('[AuthContext] Error getting session:', error)
        }

        if (!mounted) return

        console.log('[AuthContext] Session found:', !!session?.user)
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchTenant(session.user.id)
        }
      } catch (error) {
        console.error('[AuthContext] Exception initializing auth:', error)
      } finally {
        if (mounted) {
          console.log('[AuthContext] Setting loading to false')
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth state changed:', event)

      if (!mounted) return

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        try {
          await fetchTenant(session.user.id)
        } catch (error) {
          console.error('[AuthContext] Error in onAuthStateChange:', error)
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
    console.log('[AuthContext] Signing out...')
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('[AuthContext] Error signing out:', error)
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
