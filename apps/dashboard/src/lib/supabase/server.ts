import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(url && key && url.startsWith('http') && key.length > 10)
}

// Mock client for when Supabase is not available
function getMockClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      exchangeCodeForSession: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          order: () => ({ data: [], error: null }),
        }),
        order: () => ({ data: [], error: null }),
      }),
      update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }) }),
      insert: () => ({
        select: () => ({
          single: async () => ({
            data: { id: `demo-${Date.now()}` },
            error: null,
          }),
        }),
      }),
    }),
  } as unknown as ReturnType<typeof createServerClient>
}

export async function createClient() {
  if (!isSupabaseConfigured()) {
    return getMockClient()
  }

  try {
    const cookieStore = await cookies()

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
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
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      }
    )
  } catch (error) {
    console.error('Failed to create server Supabase client:', error)
    return getMockClient()
  }
}
