// Supabase client creation — consolidates server, admin, and browser clients
// Adapted from apps/dashboard/src/lib/supabase/server.ts and client.ts

import { createServerClient, createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import type { DbContext } from '../../db'

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(url && key && url.startsWith('http') && key.length > 10)
}

export function getSupabaseClient(context: DbContext): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  switch (context.type) {
    case 'admin': {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!url || !serviceKey) {
        throw new Error('Missing SUPABASE_URL or SERVICE_ROLE_KEY for admin client')
      }
      return createSupabaseClient(url, serviceKey)
    }

    case 'supabase-client': {
      // The caller already has a SupabaseClient — return it directly.
      return context.client as SupabaseClient
    }

    default: {
      // Fallback: create a plain browser client
      return createBrowserClient(url, anonKey) as unknown as SupabaseClient
    }
  }
}

/**
 * Get a Supabase client for server-side use with pre-resolved cookies.
 * This is the primary entry point for API routes.
 */
export function getServerClient(cookieStore: {
  getAll(): { name: string; value: string }[]
  set(name: string, value: string, options?: Record<string, unknown>): void
}): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        try {
          return cookieStore.getAll()
        } catch {
          return []
        }
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Ignore cookie setting errors in Server Components
        }
      },
    },
  }) as SupabaseClient
}

export function getAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_URL or SERVICE_ROLE_KEY for admin client')
  }
  return createSupabaseClient(url, serviceKey)
}
