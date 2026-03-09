// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY — Shared API Route Auth Helpers
// ═══════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { createDb } from '@sanctuary/database'

type AuthResult =
  | { ok: true; user: { id: string; email?: string }; userType: string | null; supabase: Awaited<ReturnType<typeof createClient>>; db: ReturnType<typeof createDb> }
  | { ok: false; response: NextResponse }

/**
 * Require authentication for an API route.
 * Returns user, supabase client, and db instance — or a 401/503 response.
 */
export async function requireAuth(): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, response: NextResponse.json({ error: 'Service unavailable' }, { status: 503 }) }
  }

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const db = createDb({ type: 'supabase-client', client: supabase })
  const { data: profile } = await db.users.getUserType(user.id)

  return { ok: true, user, userType: profile?.user_type ?? null, supabase, db }
}

/**
 * Require partner role for an API route.
 */
export async function requirePartnerAuth(): Promise<AuthResult> {
  const auth = await requireAuth()
  if (!auth.ok) return auth

  if (auth.userType !== 'partner') {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden: partner role required' }, { status: 403 }) }
  }

  return auth
}

/**
 * Require founder role for an API route.
 */
export async function requireFounderAuth(): Promise<AuthResult> {
  const auth = await requireAuth()
  if (!auth.ok) return auth

  if (auth.userType !== 'founder') {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden: founder role required' }, { status: 403 }) }
  }

  return auth
}
