import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import dbConnect from '@/lib/mongodb'
import { Driver } from '@/lib/models'
import { sendDriverApprovalEmail } from '@/lib/email'

// Get pending driver applications (Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.type !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()

    // Get pending drivers with user information
    const pendingDrivers = await Driver.find({ approved: false })
      .populate('userId', 'name email phone emailVerified createdAt profilePhoto')
      .sort({ createdAt: -1 })

    return NextResponse.json(pendingDrivers)

  } catch (error) {
    console.error('Get pending drivers error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Approve or reject driver application
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.type !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { driverId, approved } = await request.json()

    if (!driverId || typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'Driver ID and approval status are required' },
        { status: 400 }
      )
    }

    await dbConnect()

    const driver = await Driver.findById(driverId).populate('userId')

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      )
    }

    if (driver.approved && approved) {
      return NextResponse.json(
        { error: 'Driver is already approved' },
        { status: 400 }
      )
    }

    // Update driver approval status
    driver.approved = approved
    await driver.save()

    // Send notification email
    const emailResult = await sendDriverApprovalEmail(
      driver.userId.email,
      driver.userId.name,
      approved
    )

    if (!emailResult.success) {
      console.error('Failed to send approval email:', emailResult.error)
    }

    return NextResponse.json({
      message: `Driver ${approved ? 'approved' : 'rejected'} successfully`,
      driver: {
        id: driver._id,
        approved: driver.approved,
        userId: driver.userId._id,
        name: driver.userId.name,
        email: driver.userId.email
      }
    })

  } catch (error) {
    console.error('Update driver approval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
