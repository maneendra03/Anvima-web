import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { loginSchema } from '@/lib/validations/auth'
import { generateToken } from '@/lib/auth/jwt'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Find user with password
    const user = await User.findOne({ email: validatedData.email }).select('+password')
    if (!user) {
      return errorResponse('Invalid email or password', 401)
    }

    // Check password
    const isPasswordValid = await user.comparePassword(validatedData.password)
    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401)
    }

    // Check if email is verified
    if (!user.isVerified) {
      return errorResponse(
        'Please verify your email address before logging in',
        403
      )
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    // Set HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return successResponse(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
        },
        token,
      },
      'Login successful'
    )
  } catch (error) {
    return handleApiError(error)
  }
}
