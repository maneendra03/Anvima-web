import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { changePasswordSchema } from '@/lib/validations/auth'
import { requireAuth, isAuthenticated } from '@/lib/auth/middleware'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!isAuthenticated(authResult)) return authResult

    await dbConnect()

    const body = await request.json()
    const validatedData = changePasswordSchema.parse(body)

    // Get user with password
    const user = await User.findById(authResult.userId).select('+password')
    if (!user) {
      return errorResponse('User not found', 404)
    }

    // Check current password
    const isPasswordValid = await user.comparePassword(validatedData.currentPassword)
    if (!isPasswordValid) {
      return errorResponse('Current password is incorrect', 400)
    }

    // Update password
    user.password = validatedData.newPassword
    await user.save()

    return successResponse(null, 'Password changed successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
