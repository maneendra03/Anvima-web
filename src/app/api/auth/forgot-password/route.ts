import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { forgotPasswordSchema } from '@/lib/validations/auth'
import { generateResetToken, hashToken } from '@/lib/auth/jwt'
import { sendPasswordResetEmail } from '@/lib/email'
import { successResponse, handleApiError } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const validatedData = forgotPasswordSchema.parse(body)

    // Find user
    const user = await User.findOne({ email: validatedData.email })

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse(
        null,
        'If an account exists with this email, you will receive a password reset link.'
      )
    }

    // Generate reset token
    const resetToken = generateResetToken()
    const hashedToken = hashToken(resetToken)

    // Update user with reset token (expires in 1 hour)
    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await user.save()

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken)
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      // Clear the reset token if email fails
      user.resetPasswordToken = undefined
      user.resetPasswordExpires = undefined
      await user.save()
    }

    return successResponse(
      null,
      'If an account exists with this email, you will receive a password reset link.'
    )
  } catch (error) {
    return handleApiError(error)
  }
}
