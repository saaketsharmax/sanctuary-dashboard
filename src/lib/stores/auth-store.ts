import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MockUser } from '@/lib/mock-data'
import { getMockUserByEmail } from '@/lib/mock-data'

interface AuthState {
  user: MockUser | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  setUser: (user: MockUser | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, _password: string) => {
        set({ isLoading: true })

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        const user = getMockUserByEmail(email)

        if (user) {
          set({ user, isAuthenticated: true, isLoading: false })
          return true
        }

        // For demo: allow any email with partner/founder domain
        if (email.endsWith('@sanctuary.vc')) {
          const demoUser: MockUser = {
            id: 'demo-partner',
            email,
            name: 'Demo Partner',
            avatarUrl: null,
            role: 'partner',
            startupId: null,
          }
          set({ user: demoUser, isAuthenticated: true, isLoading: false })
          return true
        }

        set({ isLoading: false })
        return false
      },

      logout: () => {
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

// Helper hooks
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
