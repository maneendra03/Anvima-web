import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { requireAuth, isAuthenticated } from '@/lib/auth/middleware'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

// GET /api/user/notifications - Get user notification preferences
export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!isAuthenticated(authResult)) return authResult

    await dbConnect()

    const user = await User.findById(authResult.userId).select('notificationPreferences')
    
    if (!user) {
      return errorResponse('User not found', 404)
    }

    // Return notification preferences with defaults
    const preferences = {
      orderUpdates: user.notificationPreferences?.orderUpdates ?? true,
      promotions: user.notificationPreferences?.promotions ?? false,
      newsletter: user.notificationPreferences?.newsletter ?? true,
      sms: user.notificationPreferences?.sms ?? false,
    }

    return successResponse(preferences, 'Notification preferences fetched successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/user/notifications - Update user notification preferences
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!isAuthenticated(authResult)) return authResult

    await dbConnect()

    const body = await request.json()
    
    // Build update object for notification preferences
    const updateFields: Record<string, boolean> = {}
    const allowedFields = ['orderUpdates', 'promotions', 'newsletter', 'sms']
    
    for (const field of allowedFields) {
      if (typeof body[field] === 'boolean') {
        updateFields[`notificationPreferences.${field}`] = body[field]
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return errorResponse('No valid notification preferences provided', 400)
    }

    const user = await User.findByIdAndUpdate(
      authResult.userId,
      { $set: updateFields },
      { new: true }
    ).select('notificationPreferences')

    if (!user) {
      return errorResponse('User not found', 404)
    }

    return successResponse(user.notificationPreferences, 'Notification preferences updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
