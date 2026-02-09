import { createBrowserClient } from '@supabase/ssr'

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  // Ensure both URL and key exist and are not empty strings
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return !!(url && key && url.startsWith('http') && key.length > 10)
}

// Mock subscription for demo mode
const mockSubscription = {
  unsubscribe: () => {},
}

// Singleton client instance
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!isSupabaseConfigured()) {
    // Return a mock client that works without Supabase
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signUp: async () => ({ data: null, error: new Error('Supabase not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.') }),
        signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.') }),
        signInWithOAuth: async () => ({ data: null, error: new Error('Supabase not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.') }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: mockSubscription } }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }) }),
        insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
      }),
    } as unknown as ReturnType<typeof createBrowserClient>
  }

  // Return existing client if already created (singleton pattern)
  if (supabaseClient) {
    return supabaseClient
  }

  try {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    )
    return supabaseClient
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    // Return mock client as fallback
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: new Error('Client initialization failed') }),
        signUp: async () => ({ data: null, error: new Error('Client initialization failed') }),
        signInWithPassword: async () => ({ data: null, error: new Error('Client initialization failed') }),
        signInWithOAuth: async () => ({ data: null, error: new Error('Client initialization failed') }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: mockSubscription } }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }) }),
        insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
      }),
    } as unknown as ReturnType<typeof createBrowserClient>
  }
}
