import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Order from '@/models/Order'
import Review from '@/models/Review'
import CustomOrder from '@/models/CustomOrder'
import { requireAuth, isAuthenticated } from '@/lib/auth/middleware'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { cookies } from 'next/headers'

// DELETE /api/user/delete-account - Permanently delete user account
export async function DELETE() {
  try {
    const authResult = await requireAuth()
    if (!isAuthenticated(authResult)) return authResult

    await dbConnect()

    const userId = authResult.userId

    // Find user first to check if exists
    const user = await User.findById(userId)
    if (!user) {
      return errorResponse('User not found', 404)
    }

    // Don't allow admin deletion through this endpoint
    if (user.role === 'admin') {
      return errorResponse('Admin accounts cannot be deleted through this endpoint', 403)
    }

    // Delete all user-related data
    await Promise.all([
      // Delete user's reviews
      Review.deleteMany({ user: userId }),
      // Delete user's custom orders
      CustomOrder.deleteMany({ user: userId }),
      // Note: We keep order history for business records but anonymize
      Order.updateMany(
        { user: userId },
        { 
          $set: { 
            'shippingAddress.name': 'Deleted User',
            'shippingAddress.phone': '0000000000',
            'shippingAddress.email': 'deleted@user.com',
          }
        }
      ),
    ])

    // Delete the user account
    await User.findByIdAndDelete(userId)

    // Clear auth cookie
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')

    return successResponse(null, 'Account deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
