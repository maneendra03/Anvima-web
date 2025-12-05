import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { requireAuth, isAuthenticated } from '@/lib/auth/middleware'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

export async function GET() {
  try {
    const authResult = await requireAuth()

    if (!isAuthenticated(authResult)) {
      return authResult
    }

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
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        isVerified: user.isVerified,
        addresses: user.addresses,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
