import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { updateProfileSchema } from '@/lib/validations/auth'
import { requireAuth, isAuthenticated } from '@/lib/auth/middleware'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

// GET /api/user/profile - Get user profile
export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!isAuthenticated(authResult)) return authResult

    await dbConnect()

    const user = await User.findById(authResult.userId)
    if (!user) {
      return errorResponse('User not found', 404)
    }

    return successResponse({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        addresses: user.addresses,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!isAuthenticated(authResult)) return authResult

    await dbConnect()

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    const user = await User.findByIdAndUpdate(
      authResult.userId,
      {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.phone !== undefined && { phone: validatedData.phone }),
      },
      { new: true }
    )

    if (!user) {
      return errorResponse('User not found', 404)
    }

    return successResponse({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
      },
    }, 'Profile updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
