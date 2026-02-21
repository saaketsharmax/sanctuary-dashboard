import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/callback',
  '/apply',
  '/interview',
  '/preview',
]

// Routes that require authentication but no specific role
const authOnlyRoutes = [
  '/auth/role-select',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and api routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next()
  }

  // If Supabase is not configured, allow all routes (demo mode)
  if (!isSupabaseConfigured()) {
    return NextResponse.next()
  }

  // Get user session
  const { user, userType, supabaseResponse } = await updateSession(request)

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  // If not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If authenticated but on login/signup page, redirect to dashboard or role-select
  if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    if (userType === 'founder') return NextResponse.redirect(new URL('/founder/dashboard', request.url))
    if (userType === 'partner') return NextResponse.redirect(new URL('/partner/dashboard', request.url))
    return NextResponse.redirect(new URL('/auth/role-select', request.url))
  }

  // If authenticated user visits root, redirect based on role
  if (user && pathname === '/') {
    if (userType === 'founder') return NextResponse.redirect(new URL('/founder/dashboard', request.url))
    if (userType === 'partner') return NextResponse.redirect(new URL('/partner/dashboard', request.url))
    return NextResponse.redirect(new URL('/auth/role-select', request.url))
  }

  // Role-based route guards
  if (user) {
    const isFounderRoute = pathname.startsWith('/founder')
    const isPartnerRoute = pathname.startsWith('/partner')

    // User has no role but is trying to access role-specific routes
    if (!userType && (isFounderRoute || isPartnerRoute)) {
      return NextResponse.redirect(new URL('/auth/role-select', request.url))
    }

    // Founder trying to access partner routes
    if (userType === 'founder' && isPartnerRoute) {
      return NextResponse.redirect(new URL('/founder/dashboard', request.url))
    }

    // Partner trying to access founder routes
    if (userType === 'partner' && isFounderRoute) {
      return NextResponse.redirect(new URL('/partner/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
