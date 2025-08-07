import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { User } from '@/lib/models'
import { generatePasswordResetToken } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    await dbConnect()

    const user = await User.findOne({ 
      email: email.toLowerCase().trim() 
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'If an account with that email exists, you will receive a password reset email.'
      })
    }

    // Check if user's email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email address first.' },
        { status: 400 }
      )
    }

    // Generate password reset token
    const resetToken = generatePasswordResetToken(user._id.toString())

    // Save reset token and expiration
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await user.save()

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken
    )

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'If an account with that email exists, you will receive a password reset email.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
