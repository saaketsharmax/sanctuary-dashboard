'use client'

import { useEffect, useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { useAuthStore, type UserProfile } from '@/lib/stores/auth-store'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

interface AuthProviderProps {
  children: React.ReactNode
}

// Helper to check if an error is an abort/network error
function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const name = error.name.toLowerCase()
    const message = error.message.toLowerCase()
    return (
      name === 'aborterror' ||
      name === 'typeerror' ||
      message.includes('abort') ||
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('failed to fetch')
    )
  }
  return false
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setSupabaseUser, setProfile, setLoading } = useAuthStore()
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    // Skip auth initialization if Supabase is not configured
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, running in demo mode')
      setLoading(false)
      return
    }

    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null
    const supabase = createClient()

    // Check for existing session on mount with timeout
    const initAuth = async () => {
      // Set a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        if (mounted) {
          console.warn('Auth initialization timed out - continuing without auth')
          setAuthError('Connection timed out')
          setLoading(false)
        }
      }, 8000) // Increased to 8 seconds for slower connections

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (!mounted) return

        if (userError) {
          // Handle auth errors gracefully
          if (isNetworkError(userError)) {
            console.warn('Network error during auth - continuing without auth:', userError.message)
            setAuthError('Network connection issue')
          } else {
            console.warn('Auth error:', userError.message)
          }
          return
        }

        if (user) {
          setSupabaseUser(user)

          // Fetch user profile from our users table
          try {
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single()

            if (!mounted) return

            if (profileError) {
              console.warn('Failed to fetch profile:', profileError.message)
            } else if (profile) {
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
          } catch (profileError) {
            if (mounted && !isNetworkError(profileError)) {
              console.error('Profile fetch error:', profileError)
            }
          }
        }
      } catch (error) {
        if (!mounted) return

        // Handle abort errors and network errors gracefully
        if (isNetworkError(error)) {
          console.warn('Network/abort error during auth initialization - app will continue:', error)
          setAuthError('Connection interrupted')
        } else {
          console.error('Auth initialization error:', error)
        }
      } finally {
        if (mounted) {
          if (timeoutId) clearTimeout(timeoutId)
          setLoading(false)
        }
      }
    }

    initAuth()

    // Listen for auth state changes
    let subscription: { unsubscribe: () => void } | null = null
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, session: Session | null) => {
          if (!mounted) return

          try {
            if (event === 'SIGNED_IN' && session?.user) {
              setSupabaseUser(session.user)
              setAuthError(null)

              // Fetch user profile
              const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single()

              if (mounted && profile) {
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
          } catch (error) {
            if (!isNetworkError(error)) {
              console.error('Auth state change error:', error)
            }
          }
        }
      )
      subscription = data.subscription
    } catch (error) {
      console.warn('Failed to set up auth listener:', error)
    }

    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
      if (subscription) {
        try {
          subscription.unsubscribe()
        } catch {
          // Ignore unsubscribe errors
        }
      }
    }
  }, [setSupabaseUser, setProfile, setLoading])

  // Log auth errors for debugging but don't crash the app
  useEffect(() => {
    if (authError && process.env.NODE_ENV === 'development') {
      console.log('Auth status:', authError)
    }
  }, [authError])

  return <>{children}</>
}
