/**
 * Auth Store - Legacy compatibility layer
 *
 * This store is kept for backward compatibility with existing components.
 * New code should use NextAuth's useSession hook instead.
 *
 * The auth-config.ts and session.ts files contain the new auth implementation.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserType, PartnerSubType } from '@/types'

// Extended user type for the new auth system
export interface AuthUser {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  userType: UserType | null
  partnerSubType: PartnerSubType | null
  startupId: string | null
  onboardingComplete: boolean
}

// Legacy mock user type for backward compatibility
export interface MockUser {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  role: 'partner' | 'founder' | 'mentor' | 'admin'
  startupId: string | null
}

interface AuthState {
  user: MockUser | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  setUser: (user: MockUser | null) => void
}

// Note: This store is deprecated. Use NextAuth useSession() instead.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async () => {
        // Deprecated - use signIn from next-auth/react instead
        console.warn('useAuthStore.login is deprecated. Use signIn from next-auth/react instead.')
        set({ isLoading: false })
        return false
      },

      logout: () => {
        // Deprecated - use signOut from next-auth/react instead
        console.warn('useAuthStore.logout is deprecated. Use signOut from next-auth/react instead.')
        set({ user: null, isAuthenticated: false })
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user })
      },
    }),
    {
      name: 'sanctuary-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

// Legacy helper hooks - prefer using useSession from next-auth/react
export function useUser() {
  return useAuthStore((state) => state.user)
}

export function useIsAuthenticated() {
  return useAuthStore((state) => state.isAuthenticated)
}

export function useIsPartner() {
  const user = useAuthStore((state) => state.user)
  return user?.role === 'partner' || user?.role === 'admin'
}

export function useIsFounder() {
  const user = useAuthStore((state) => state.user)
  return user?.role === 'founder'
}

/**
 * Hook to convert NextAuth session to legacy MockUser format
 * Use this for components that still expect the old format
 */
export function sessionToMockUser(session: {
  user?: {
    id?: string
    email?: string | null
    name?: string | null
    image?: string | null
    userType?: UserType | null
    partnerSubType?: PartnerSubType | null
    startupId?: string | null
  }
} | null): MockUser | null {
  if (!session?.user) return null

  const roleMap: Record<string, MockUser['role']> = {
    founder: 'founder',
    partner: 'partner',
  }

  return {
    id: session.user.id || '',
    email: session.user.email || '',
    name: session.user.name || '',
    avatarUrl: session.user.image || null,
    role: session.user.userType ? roleMap[session.user.userType] || 'partner' : 'partner',
    startupId: session.user.startupId || null,
  }
}
