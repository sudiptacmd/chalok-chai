import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.redirect(new URL('/signin', request.url))
    }

    const userType = session.user.type

    // Redirect based on user type
    if (userType === 'admin' || userType === 'owner') {
      return NextResponse.redirect(new URL('/find-driver', request.url))
    } else if (userType === 'driver') {
      return NextResponse.redirect(new URL('/driver-dashboard', request.url))
    }

    // Default fallback
    return NextResponse.redirect(new URL('/', request.url))

  } catch (error) {
    console.error('Redirect API error:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}
