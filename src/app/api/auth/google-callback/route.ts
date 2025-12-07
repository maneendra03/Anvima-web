import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { generateToken } from '@/lib/auth/jwt'

// This endpoint is called after Google OAuth to sync session and set custom auth cookie
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const redirectTo = searchParams.get('redirect') || '/'
    const baseUrl = new URL(request.url).origin

    console.log('🔄 Google callback - checking session...')
    
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      console.log('❌ No session found in google-callback')
      // No session, redirect to login
      return NextResponse.redirect(new URL('/login?error=NoSession', baseUrl))
    }

    console.log('✅ Session found for:', session.user.email)

    await dbConnect()

    // Find or create user
    let user = await User.findOne({ email: session.user.email })

    if (!user) {
      // Create new user from Google data
      user = new User({
        name: session.user.name || 'User',
        email: session.user.email,
        avatar: session.user.image || '',
        isVerified: true,
        role: 'user',
      })
      await user.save()
      console.log('✅ New user created from Google sign-in:', user.email)
    }

    // Generate our custom JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    console.log('✅ Generated auth token for:', user.email)

    // Create redirect response
    const response = NextResponse.redirect(new URL(redirectTo, baseUrl))

    // Set our custom auth cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    console.log('✅ Google auth synced and cookie set for user:', user.email)

    return response
  } catch (error) {
    console.error('❌ Google callback error:', error)
    const baseUrl = new URL(request.url).origin
    return NextResponse.redirect(new URL('/login?error=CallbackError', baseUrl))
  }
}
