import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/auth-config'

// Routes that don't require authentication
const publicRoutes = [
  '/login',
  '/signup',
  '/api/auth',
]

// Routes that require role selection
const roleSelectRoute = '/auth/role-select'

// Check if path matches any public routes
function isPublicRoute(path: string): boolean {
  return publicRoutes.some(route => path.startsWith(route))
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const token = req.auth

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Allow role-select page
  if (pathname === roleSelectRoute) {
    // But redirect if user already has a role
    if (token?.user?.userType) {
      const redirectUrl = token.user.userType === 'founder'
        ? '/founder/dashboard'
        : '/partner/dashboard'
      return NextResponse.redirect(new URL(redirectUrl, req.url))
    }
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Require role selection for new users
  if (!token.user?.userType) {
    // Don't redirect if already on role-select or if it's an API route
    if (pathname.startsWith('/api/')) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL(roleSelectRoute, req.url))
  }

  // Founder routes → founder only
  if (pathname.startsWith('/founder')) {
    if (token.user.userType !== 'founder') {
      return NextResponse.redirect(new URL('/partner/dashboard', req.url))
    }
  }

  // Partner routes → partner only
  if (pathname.startsWith('/partner')) {
    if (token.user.userType !== 'partner') {
      return NextResponse.redirect(new URL('/founder/dashboard', req.url))
    }
  }

  // Redirect root to appropriate dashboard
  if (pathname === '/') {
    const redirectUrl = token.user.userType === 'founder'
      ? '/founder/dashboard'
      : '/partner/dashboard'
    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  // Redirect old routes to new structure
  if (pathname === '/portfolio') {
    return NextResponse.redirect(new URL('/partner/portfolio', req.url))
  }
  if (pathname.startsWith('/startup/')) {
    const id = pathname.split('/startup/')[1]
    return NextResponse.redirect(new URL(`/partner/portfolio/${id}`, req.url))
  }
  if (pathname === '/metrics') {
    return NextResponse.redirect(new URL('/partner/metrics', req.url))
  }
  if (pathname === '/mentors' || pathname.startsWith('/mentors/')) {
    const rest = pathname.replace('/mentors', '')
    return NextResponse.redirect(new URL(`/partner/mentors${rest}`, req.url))
  }
  if (pathname === '/matches' || pathname.startsWith('/match/')) {
    const rest = pathname.replace('/match', '/matches')
    return NextResponse.redirect(new URL(`/partner${rest}`, req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
