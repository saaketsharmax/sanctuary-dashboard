import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'founder' | 'partner' | null

interface RoleState {
  role: UserRole
  setRole: (role: UserRole) => void
  clearRole: () => void
}

// Mock user data for display purposes
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

export const useAuthStore = create<RoleState>()(
  persist(
    (set) => ({
      role: null,

      setRole: (role: UserRole) => {
        set({ role })
      },

      clearRole: () => {
        set({ role: null })
      },
    }),
    {
      name: 'sanctuary-role',
    }
  )
)

// Helper hooks for backwards compatibility
export function useUser() {
  const role = useAuthStore((state) => state.role)
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
