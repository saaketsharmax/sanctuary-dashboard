// Supabase implementation of AuthProvider
// Wraps the existing @supabase/supabase-js auth methods

import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthProvider, AuthUser, AuthResult } from '../interfaces'

function mapUser(supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null): AuthUser | null {
  if (!supabaseUser) return null
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: (supabaseUser.user_metadata?.name as string) || null,
    avatarUrl: (supabaseUser.user_metadata?.avatar_url as string) || null,
  }
}

export class SupabaseAuthProvider implements AuthProvider {
  constructor(private client: SupabaseClient) {}

  async getUser(): Promise<{ user: AuthUser | null; error: Error | null }> {
    const { data, error } = await this.client.auth.getUser()
    return { user: mapUser(data.user), error }
  }

  async signUp(
    email: string,
    password: string,
    metadata?: Record<string, unknown>
  ): Promise<AuthResult> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: metadata ? { data: metadata } : undefined,
    })
    return { user: mapUser(data.user), error }
  }

  async signInWithPassword(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    })
    return { user: mapUser(data.user), error }
  }

  async signInWithOAuth(
    provider: 'google' | 'github'
  ): Promise<{ url: string } | { error: Error }> {
    const { data, error } = await this.client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : undefined,
      },
    })
    if (error) return { error }
    return { url: data.url }
  }

  async signOut(): Promise<{ error: Error | null }> {
    const { error } = await this.client.auth.signOut()
    return { error }
  }

  async exchangeCodeForSession(code: string): Promise<{ error: Error | null }> {
    const { error } = await this.client.auth.exchangeCodeForSession(code)
    return { error }
  }

  onAuthStateChange(
    cb: (event: 'SIGNED_IN' | 'SIGNED_OUT', user: AuthUser | null) => void
  ): { unsubscribe: () => void } {
    const { data } = this.client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        cb(event, mapUser(session?.user ?? null))
      }
    })
    return { unsubscribe: () => data.subscription.unsubscribe() }
  }
}
