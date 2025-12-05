import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { registerSchema } from '@/lib/validations/auth'
import { generateVerificationToken, hashToken } from '@/lib/auth/jwt'
import { sendVerificationEmail } from '@/lib/email'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email })
    if (existingUser) {
      return errorResponse('An account with this email already exists', 409)
    }

    // Generate verification token
    const verificationToken = generateVerificationToken()
    const hashedToken = hashToken(verificationToken)

    // Skip email verification if not configured or explicitly disabled
    const emailConfigured = process.env.EMAIL_SERVER_HOST && 
                           process.env.EMAIL_SERVER_USER && 
                           process.env.EMAIL_SERVER_PASSWORD &&
                           process.env.EMAIL_SERVER_PASSWORD !== 'your-app-password'
    const skipEmailVerification = process.env.NODE_ENV === 'development' || 
                                  process.env.SKIP_EMAIL_VERIFICATION === 'true' ||
                                  !emailConfigured

    // Create user
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      phone: validatedData.phone,
      verificationToken: skipEmailVerification ? undefined : hashedToken,
      isVerified: skipEmailVerification, // Auto-verify in development
    })

    // Send verification email (only if not skipping)
    if (!skipEmailVerification) {
      try {
        await sendVerificationEmail(user.email, user.name, verificationToken)
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError)
        // Don't fail registration if email fails
      }
    }

    const message = skipEmailVerification
      ? 'Registration successful! You can now login.'
      : 'Registration successful! Please check your email to verify your account.'

    return successResponse(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      message,
      201
    )
  } catch (error) {
    return handleApiError(error)
  }
}
