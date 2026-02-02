import { createClient } from './client'
import type { UserRole, PartnerSubType } from '@/lib/stores/auth-store'

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, name?: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  })

  return { data, error }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

/**
 * Sign in with OAuth provider (Google, GitHub)
 */
export async function signInWithOAuth(provider: 'google' | 'github') {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  return { data, error }
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Update user type (founder/partner) after role selection
 */
export async function updateUserType(
  userType: UserRole,
  partnerSubType?: PartnerSubType
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: new Error('Not authenticated') }
  }

  const { data, error } = await supabase
    .from('users')
    .update({
      user_type: userType,
      partner_sub_type: partnerSubType || null,
    })
    .eq('id', user.id)
    .select()
    .single()

  return { data, error }
}

/**
 * Get current user profile
 */
export async function getUserProfile() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return { data, error }
}

/**
 * Update user profile
 */
export async function updateUserProfile(updates: {
  name?: string
  avatar_url?: string
}) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: new Error('Not authenticated') }
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  return { data, error }
}
