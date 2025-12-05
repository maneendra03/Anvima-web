import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { forgotPasswordSchema } from '@/lib/validations/auth'
import { generateVerificationToken, hashToken } from '@/lib/auth/jwt'
import { sendVerificationEmail } from '@/lib/email'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const validatedData = forgotPasswordSchema.parse(body) // Reuse email validation

    // Find user
    const user = await User.findOne({ email: validatedData.email })

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse(
        null,
        'If an unverified account exists with this email, you will receive a verification link.'
      )
    }

    // Check if already verified
    if (user.isVerified) {
      return errorResponse('This email is already verified', 400)
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken()
    const hashedToken = hashToken(verificationToken)

    // Update user with new token
    user.verificationToken = hashedToken
    await user.save()

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
    }

    return successResponse(
      null,
      'If an unverified account exists with this email, you will receive a verification link.'
    )
  } catch (error) {
    return handleApiError(error)
  }
}
