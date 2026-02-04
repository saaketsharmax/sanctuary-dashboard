import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/callback',
]

// Routes that require authentication but no specific role
const authOnlyRoutes = [
  '/auth/role-select',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and api routes (except auth callback)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next()
  }

  // Get user session
  const { user, supabaseResponse } = await updateSession(request)

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  // Check if route is auth-only (needs auth but no role)
  const isAuthOnlyRoute = authOnlyRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  // If not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If authenticated but on login/signup page, redirect to role-select or dashboard
  if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    return NextResponse.redirect(new URL('/auth/role-select', request.url))
  }

  // For protected routes (founder/* and partner/*), we could check role here
  // but for now we'll let the layouts handle role-specific access
  // This keeps the middleware fast and avoids additional DB queries

  // If authenticated user visits root, redirect based on context
  if (user && pathname === '/') {
    // Redirect to role-select to determine where to go
    return NextResponse.redirect(new URL('/auth/role-select', request.url))
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
