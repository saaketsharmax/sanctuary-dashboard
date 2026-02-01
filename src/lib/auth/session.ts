import { auth } from './auth-config'
import { redirect } from 'next/navigation'
import type { UserType, PartnerSubType } from '@/types'

export interface SessionUser {
  id: string
  email: string
  name: string
  image?: string | null
  userType: UserType | null
  partnerSubType: PartnerSubType | null
  startupId: string | null
  onboardingComplete: boolean
}

/**
 * Get the current session (server-side)
 */
export async function getSession() {
  return await auth()
}

/**
 * Get the current user from session (server-side)
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession()
  return session?.user || null
}

/**
 * Require authentication - redirects to login if not authenticated
 * Use in server components or route handlers
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

/**
 * Require role selection - redirects to role-select if no userType
 * Use after requireAuth to ensure user has selected a role
 */
export async function requireRole(): Promise<SessionUser> {
  const user = await requireAuth()

  if (!user.userType) {
    redirect('/auth/role-select')
  }

  return user
}

/**
 * Require founder role - redirects if not a founder
 */
export async function requireFounder(): Promise<SessionUser> {
  const user = await requireRole()

  if (user.userType !== 'founder') {
    redirect('/partner/dashboard')
  }

  return user
}

/**
 * Require partner role - redirects if not a partner
 */
export async function requirePartner(): Promise<SessionUser> {
  const user = await requireRole()

  if (user.userType !== 'partner') {
    redirect('/founder/dashboard')
  }

  return user
}

/**
 * Check if user has specific partner sub-type
 */
export function hasPartnerSubType(
  user: SessionUser,
  subTypes: PartnerSubType | PartnerSubType[]
): boolean {
  if (user.userType !== 'partner' || !user.partnerSubType) {
    return false
  }

  const types = Array.isArray(subTypes) ? subTypes : [subTypes]
  return types.includes(user.partnerSubType)
}

/**
 * Check if partner has full access (startup_manager has most permissions)
 */
export function hasFullAccess(user: SessionUser): boolean {
  return user.userType === 'partner' && user.partnerSubType === 'startup_manager'
}

/**
 * Check if partner can access investment features
 */
export function canAccessInvestment(user: SessionUser): boolean {
  return (
    user.userType === 'partner' &&
    (user.partnerSubType === 'vc' || user.partnerSubType === 'startup_manager')
  )
}

/**
 * Check if partner can access mentor matching
 */
export function canAccessMentorMatching(user: SessionUser): boolean {
  return (
    user.userType === 'partner' &&
    (user.partnerSubType === 'mentor' || user.partnerSubType === 'startup_manager')
  )
}
