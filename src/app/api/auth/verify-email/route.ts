import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { verifyEmailSchema } from '@/lib/validations/auth'
import { hashToken } from '@/lib/auth/jwt'
import { sendWelcomeEmail } from '@/lib/email'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const validatedData = verifyEmailSchema.parse(body)

    // Hash the token to compare with stored hash
    const hashedToken = hashToken(validatedData.token)

    // Find user with this verification token
    const user = await User.findOne({ verificationToken: hashedToken })
    if (!user) {
      return errorResponse('Invalid or expired verification token', 400)
    }

    // Check if already verified
    if (user.isVerified) {
      return errorResponse('Email is already verified', 400)
    }

    // Update user
    user.isVerified = true
    user.verificationToken = undefined
    await user.save()

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
    }

    return successResponse(
      { email: user.email },
      'Email verified successfully! You can now log in.'
    )
  } catch (error) {
    return handleApiError(error)
  }
}
