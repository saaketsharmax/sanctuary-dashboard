import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'

export type UserRole = 'founder' | 'partner' | null
export type PartnerSubType = 'mentor' | 'vc' | 'startup_manager' | null

// User profile from Supabase
export interface UserProfile {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  userType: UserRole
  partnerSubType: PartnerSubType
  startupId: string | null
  onboardingComplete: boolean
}

interface AuthState {
  // Role (persisted locally for quick access)
  role: UserRole
  partnerSubType: PartnerSubType

  // Supabase user (not persisted - managed by Supabase)
  supabaseUser: User | null
  profile: UserProfile | null
  isLoading: boolean

  // Actions
  setRole: (role: UserRole, partnerSubType?: PartnerSubType) => void
  clearRole: () => void
  setSupabaseUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
}

// Default placeholder data (shown when user profile not yet loaded)
export const defaultFounder = {
  id: '',
  name: 'Founder',
  email: '',
  company: '',
  avatarUrl: null,
}

export const defaultPartner = {
  id: '',
  name: 'Partner',
  email: '',
  avatarUrl: null,
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      partnerSubType: null,
      supabaseUser: null,
      profile: null,
      isLoading: true,

      setRole: (role: UserRole, partnerSubType?: PartnerSubType) => {
        set({ role, partnerSubType: partnerSubType || null })
      },

      clearRole: () => {
        set({ role: null, partnerSubType: null, profile: null })
      },

      setSupabaseUser: (user: User | null) => {
        set({ supabaseUser: user })
      },

      setProfile: (profile: UserProfile | null) => {
        if (profile) {
          set({
            profile,
            role: profile.userType,
            partnerSubType: profile.partnerSubType
          })
        } else {
          set({ profile: null })
        }
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      },
    }),
    {
      name: 'sanctuary-auth',
      // Only persist role and partnerSubType, not Supabase user
      partialize: (state) => ({
        role: state.role,
        partnerSubType: state.partnerSubType
      }),
    }
  )
)

// Helper hooks

/**
 * Returns the current user - from Supabase profile if available, otherwise default placeholders
 */
export function useUser() {
  const { role, profile } = useAuthStore((state) => ({
    role: state.role,
    profile: state.profile,
  }))

  // If we have a Supabase profile, use that
  if (profile) {
    return {
      id: profile.id,
      name: profile.name || 'User',
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      company: role === 'founder' ? 'Your Company' : undefined,
    }
  }

  // Return default placeholder (no mock data)
  if (role === 'founder') return defaultFounder
  if (role === 'partner') return defaultPartner
  return null
}

export function useIsPartner() {
  const role = useAuthStore((state) => state.role)
  return role === 'partner'
}

export function useIsFounder() {
  const role = useAuthStore((state) => state.role)
  return role === 'founder'
}

export function useCurrentRole() {
  return useAuthStore((state) => state.role)
}

export function usePartnerSubType() {
  return useAuthStore((state) => state.partnerSubType)
}

export function useIsAuthenticated() {
  const supabaseUser = useAuthStore((state) => state.supabaseUser)
  return !!supabaseUser
}

export function useAuthLoading() {
  return useAuthStore((state) => state.isLoading)
}
