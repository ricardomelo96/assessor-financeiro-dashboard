import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Tenant } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
        }

        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchTenant(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchTenant(session.user.id);
        } else {
          setTenant(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchTenant = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching tenant:', error);
        return;
      }

      setTenant(data);
    } catch (error) {
      console.error('Error fetching tenant:', error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }

      setUser(null);
      setTenant(null);
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    tenant,
    tenantPhone: tenant?.phone,
    signOut
  };
}
