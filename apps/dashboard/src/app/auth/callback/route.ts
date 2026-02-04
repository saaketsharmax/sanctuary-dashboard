import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      // Redirect to login with error
      return NextResponse.redirect(
        new URL('/auth/login?error=auth_callback_failed', request.url)
      )
    }

    // Check if user has selected a role
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', user.id)
        .single()

      // If user has a role, redirect to their dashboard
      if (profile?.user_type) {
        const redirectUrl = profile.user_type === 'founder'
          ? '/founder/dashboard'
          : '/partner/dashboard'
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    }

    // No role set, redirect to role selection
    return NextResponse.redirect(new URL('/auth/role-select', request.url))
  }

  // No code, redirect to login
  return NextResponse.redirect(new URL('/auth/login', request.url))
}
