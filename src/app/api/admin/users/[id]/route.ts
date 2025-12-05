import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { requireAdmin, isAuthenticated } from '@/lib/auth/middleware'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/admin/users/[id] - Get single user
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin()
    if (!isAuthenticated(result)) {
      return result
    }

    await dbConnect()
    const { id } = await params

    const user = await User.findById(id)
      .select('-password')
      .lean()

    if (!user) {
      return errorResponse('User not found', 404)
    }

    return successResponse(user, 'User fetched successfully')
  } catch (error) {
    console.error('Get user error:', error)
    return errorResponse('Failed to fetch user')
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin()
    if (!isAuthenticated(result)) {
      return result
    }

    const { role, isActive } = await request.json()
    const { id } = await params

    await dbConnect()

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { role, isActive } },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return errorResponse('User not found', 404)
    }

    return successResponse(user, 'User updated successfully')
  } catch (error) {
    console.error('Update user error:', error)
    return errorResponse('Failed to update user')
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin()
    if (!isAuthenticated(result)) {
      return result
    }

    await dbConnect()
    const { id } = await params

    // Prevent admin from deleting themselves
    if (id === result.userId) {
      return errorResponse('You cannot delete your own account', 400)
    }

    const user = await User.findByIdAndDelete(id)

    if (!user) {
      return errorResponse('User not found', 404)
    }

    return successResponse(null, 'User deleted successfully')
  } catch (error) {
    console.error('Delete user error:', error)
    return errorResponse('Failed to delete user')
  }
}
