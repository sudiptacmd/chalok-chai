import nodemailer from 'nodemailer'

// Create transporter with SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

/**
 * Send email verification email
 */
export async function sendEmailVerification(email: string, name: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Email - ChalokChai',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">ChalokChai</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1e293b; margin-top: 0;">Welcome to ChalokChai!</h2>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Hello ${name},
          </p>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Thank you for signing up with ChalokChai. To complete your registration and start using our platform, please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-bottom: 10px;">
            If you can't click the button above, copy and paste this link into your browser:
          </p>
          
          <p style="color: #64748b; font-size: 14px; word-break: break-all; background: #f1f5f9; padding: 10px; border-radius: 4px;">
            ${verificationUrl}
          </p>
          
          <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-top: 20px;">
            This link will expire in 24 hours for security reasons.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 14px;">
          <p>If you didn't create an account with ChalokChai, please ignore this email.</p>
          <p>© 2025 ChalokChai. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Email verification sending failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' }
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset Your Password - ChalokChai',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">ChalokChai</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1e293b; margin-top: 0;">Password Reset Request</h2>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Hello ${name},
          </p>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password for your ChalokChai account. Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-bottom: 10px;">
            If you can't click the button above, copy and paste this link into your browser:
          </p>
          
          <p style="color: #64748b; font-size: 14px; word-break: break-all; background: #f1f5f9; padding: 10px; border-radius: 4px;">
            ${resetUrl}
          </p>
          
          <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-top: 20px;">
            This link will expire in 1 hour for security reasons.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 14px;">
          <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          <p>© 2025 ChalokChai. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Password reset email sending failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' }
  }
}

/**
 * Send driver approval notification email
 */
export async function sendDriverApprovalEmail(email: string, name: string, approved: boolean) {
  const subject = approved ? 'Application Approved - ChalokChai' : 'Application Update - ChalokChai'
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">ChalokChai</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1e293b; margin-top: 0;">
            ${approved ? 'Congratulations!' : 'Application Update'}
          </h2>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Hello ${name},
          </p>
          
          ${approved ? `
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Great news! Your driver application has been approved. You can now start accepting ride requests and earning with ChalokChai.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/driver-dashboard" 
               style="background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Go to Driver Dashboard
            </a>
          </div>
          
          <p style="color: #475569; line-height: 1.6;">
            Welcome to the ChalokChai driver community!
          </p>
          ` : `
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Thank you for your interest in becoming a ChalokChai driver. After reviewing your application, we need additional information or documentation before we can proceed.
          </p>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Please contact our support team for more details on the next steps.
          </p>
          `}
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 14px;">
          <p>© 2025 ChalokChai. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Driver approval email sending failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' }
  }
}
