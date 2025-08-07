import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { User } from '@/lib/models'

export async function POST(request: NextRequest) {
  try {
    const { adminSecret } = await request.json()

    // Simple protection - use your own secret
    if (adminSecret !== 'chalokchai-admin-seed-2025') {
      return NextResponse.json(
        { error: 'Invalid admin secret' },
        { status: 401 }
      )
    }

    await dbConnect()

    // Check if admin already exists
    const existingAdmin = await User.findOne({ type: 'admin' })
    
    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Admin user already exists', email: existingAdmin.email }
      )
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin',
      email: 'admin@chalokchai.com',
      phone: '+880123456789',
      password: 'admin123456', // This will be hashed automatically
      type: 'admin',
      emailVerified: true
    })

    await adminUser.save()

    return NextResponse.json({
      message: 'Admin user created successfully',
      email: adminUser.email,
      password: 'admin123456' // Return password for initial login
    })

  } catch (error) {
    console.error('Admin seed error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
