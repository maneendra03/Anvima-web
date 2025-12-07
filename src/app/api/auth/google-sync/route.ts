import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { generateToken } from '@/lib/auth/jwt'
import { successResponse, errorResponse } from '@/lib/api-response'

// This endpoint syncs the NextAuth session with our custom auth cookie
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return errorResponse('No active session found', 401)
    }

    await dbConnect()

    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return errorResponse('User not found', 404)
    }

    // Generate our custom JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      message: 'Session synced successfully',
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified,
        },
      },
    })

    // Set our custom auth cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Session sync error:', error)
    return errorResponse('Failed to sync session')
  }
}
