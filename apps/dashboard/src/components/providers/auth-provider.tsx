'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore, type UserProfile } from '@/lib/stores/auth-store'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setSupabaseUser, setProfile, setLoading } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    // Check for existing session on mount
    const initAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          setSupabaseUser(user)

          // Fetch user profile from our users table
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profile) {
            setProfile({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              avatarUrl: profile.avatar_url,
              userType: profile.user_type,
              partnerSubType: profile.partner_sub_type,
              startupId: profile.startup_id,
              onboardingComplete: profile.onboarding_complete,
            } as UserProfile)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setSupabaseUser(session.user)

          // Fetch user profile
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setProfile({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              avatarUrl: profile.avatar_url,
              userType: profile.user_type,
              partnerSubType: profile.partner_sub_type,
              startupId: profile.startup_id,
              onboardingComplete: profile.onboarding_complete,
            } as UserProfile)
          }
        } else if (event === 'SIGNED_OUT') {
          setSupabaseUser(null)
          setProfile(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [setSupabaseUser, setProfile, setLoading])

  return <>{children}</>
}
