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

// Mock user data for display purposes (used when no Supabase auth)
export const mockFounder = {
  id: 'user-founder-1',
  name: 'Sarah Chen',
  email: 'sarah@techflow.ai',
  company: 'TechFlow AI',
  avatarUrl: null,
}

export const mockPartner = {
  id: 'user-partner-1',
  name: 'Alex Thompson',
  email: 'alex@sanctuary.vc',
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
 * Returns the current user - from Supabase profile if available, otherwise mock data
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

  // Fall back to mock data
  if (role === 'founder') return mockFounder
  if (role === 'partner') return mockPartner
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
