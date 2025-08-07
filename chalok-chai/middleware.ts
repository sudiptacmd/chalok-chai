import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // If authenticated user tries to access signin/signup, redirect to appropriate dashboard
    if (token && (pathname === '/signin' || pathname === '/signup')) {
      const userType = token.type as string
      if (userType === 'admin' || userType === 'owner') {
        return NextResponse.redirect(new URL('/find-driver', req.url))
      } else if (userType === 'driver') {
        return NextResponse.redirect(new URL('/driver-dashboard', req.url))
      }
    }

    // Route protection
    if (token) {
      const userType = token.type as string

      // Admin-only routes
      if (pathname.startsWith('/admin')) {
        if (userType !== 'admin') {
          if (userType === 'driver') {
            return NextResponse.redirect(new URL('/driver-dashboard', req.url))
          } else {
            return NextResponse.redirect(new URL('/find-driver', req.url))
          }
        }
      }

      // Driver-only routes
      if (pathname.startsWith('/driver-dashboard')) {
        if (userType !== 'driver') {
          if (userType === 'admin') {
            return NextResponse.redirect(new URL('/admin', req.url))
          } else {
            return NextResponse.redirect(new URL('/find-driver', req.url))
          }
        }
      }

      // Owner/Admin routes
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/find-driver')) {
        if (userType === 'driver') {
          return NextResponse.redirect(new URL('/driver-dashboard', req.url))
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Public routes that don't require authentication
        const publicRoutes = ['/', '/signin', '/signup', '/forgot-password', '/reset-password']
        const isPublicRoute = publicRoutes.includes(pathname)
        
        // API routes are always allowed
        if (pathname.startsWith('/api/')) {
          return true
        }

        // Allow public routes
        if (isPublicRoute) {
          return true
        }

        // All other routes require authentication
        return !!token
      }
    }
  }
)

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)']
}
