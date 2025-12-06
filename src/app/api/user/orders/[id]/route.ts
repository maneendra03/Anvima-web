import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Order from '@/models/Order'
import { requireAuth, isAuthenticated } from '@/lib/auth/middleware'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/user/orders/[id] - Get single order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!isAuthenticated(authResult)) {
      return authResult
    }

    await dbConnect()
    const { id } = await params

    // Try to find by ID or order number
    const order = await Order.findOne({
      $or: [
        { _id: id },
        { orderNumber: id.toUpperCase() }
      ],
      user: authResult.userId
    })
      .populate('items.product', 'slug')
      .lean()

    if (!order) {
      return errorResponse('Order not found', 404)
    }

    return successResponse(order, 'Order fetched successfully')
  } catch (error) {
    console.error('Error fetching order:', error)
    return errorResponse('Failed to fetch order')
  }
}
