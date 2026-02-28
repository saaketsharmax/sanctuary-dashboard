import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createDb } from '@sanctuary/database'

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(url && key && url.startsWith('http') && key.length > 10)
}

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  // If Supabase is not configured, return null user (demo mode)
  if (!isSupabaseConfigured()) {
    return { user: null, userType: null, supabaseResponse }
  }

  let response = supabaseResponse

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            try {
              return request.cookies.getAll()
            } catch {
              return []
            }
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              )
              response = NextResponse.next({
                request,
              })
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              )
            } catch {
              // Ignore cookie setting errors
            }
          },
        },
      }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Look up user_type from the users table
    let userType: string | null = null
    if (user) {
      const db = createDb({ type: 'supabase-client', client: supabase })
      const { data: profile } = await db.users.getUserType(user.id)
      userType = profile?.user_type ?? null
    }

    return { user, userType, supabaseResponse: response }
  } catch (error) {
    // If there's any error, return null user and continue
    // This prevents the middleware from crashing the entire app
    console.warn('Middleware auth error:', error instanceof Error ? error.message : 'Unknown error')
    return { user: null, userType: null, supabaseResponse }
  }
}
