import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true'
  const userRole = request.cookies.get('userRole')?.value

  // Get the pathname of the request
  const pathname = request.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = ['/', '/login']
  if (publicPaths.includes(pathname)) {
    // If user is authenticated, redirect to their dashboard
    if (isAuthenticated) {
      const dashboardPath = userRole === 'doctor' ? '/doctor/dashboard' : '/dashboard'
      return NextResponse.redirect(new URL(dashboardPath, request.url))
    }
    return NextResponse.next()
  }

  // Check if the path requires authentication
  const protectedPaths = ['/dashboard', '/doctor/dashboard', '/admin/dashboard']
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check if user has access to the current path
    if (pathname.startsWith('/doctor/') && userRole !== 'doctor') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    if (pathname.startsWith('/admin/') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    if (pathname === '/dashboard' && userRole === 'doctor') {
      return NextResponse.redirect(new URL('/doctor/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 